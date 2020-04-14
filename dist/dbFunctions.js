"use strict";
/*
    Fermata Server
    데이터베이스 접근 함수들(이곳에서만 sql 문 호출할 것)
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import modules
const app_1 = require("./app");
const security_1 = __importDefault(require("./security"));
const moment_1 = __importDefault(require("moment"));
require("moment-timezone");
class dbFunctions {
    //회원가입 쿼리
    static Signup(ID, Password, onFinish) {
        app_1.Database.query(`SELECT * FROM authusers WHERE ID=${app_1.Database.escape(ID)};`, (err, rows, fields) => {
            if (!err && rows.length == 0) { //오류가 없고 일치하는 ID가 없다면
                var Salt = security_1.default.CreateSalt();
                console.log(security_1.default.EncryptPassword(Password, Salt));
                app_1.Database.query(`INSERT INTO authusers(ID, HashedPassword, Salt, SessionID, SignupDate)
                VALUES(${app_1.Database.escape(ID)}, '${security_1.default.EncryptPassword(Password, Salt)}', '${Salt}', '', NOW());`, (err, rows, fields) => {
                    if (!err) { //오류가 없다면
                        onFinish(TaskCode.SUCCESS_WORK); //작업 완료
                    }
                    else { //오류 발생 시
                        onFinish(TaskCode.ERR_DATABASE_UNKNOWN); //알 수 없는 오류
                    }
                });
            }
            else {
                onFinish(TaskCode.ERR_SIGNUP_EXISTS_ACCOUNT);
            } //일치하는 ID가 이미 있다면
        });
    }
    //로그인 쿼리
    static Signin(ID, Password, onFinish) {
        app_1.Database.query(`SELECT * FROM authusers WHERE ID=${app_1.Database.escape(ID)};`, (err, rows, fields) => {
            if (!err && rows.length == 1) {
                var FoundUser = rows[0];
                var LoginResult = (FoundUser.HashedPassword == security_1.default.EncryptPassword(Password, FoundUser.Salt));
                if (LoginResult) { //로그인 성공 시
                    var SessionID = security_1.default.CreateSessionID();
                    app_1.Database.query(`UPDATE authusers SET SessionID='${SessionID}' WHERE ID=${app_1.Database.escape(ID)};`, (err, rows, fields) => {
                        if (!err) { //새로운 세션 ID 발급 시
                            onFinish(TaskCode.SUCCESS_WORK, SessionID);
                        }
                    });
                }
                else if (!LoginResult) { //페스워드가 틀릴 경우(* 경고 : 페스워드 오류와 일치하는 계정 없음 오류는 보안을 위해 클라이언트에서 하나의 오류로 표시할 것!)
                    onFinish(TaskCode.ERR_SIGNIN_NOT_EQUAL_PW, "");
                }
                else {
                    onFinish(TaskCode.ERR_DATABASE_UNKNOWN, "");
                } //알 수 없는 오류
            }
            else if (rows.length > 1) {
                onFinish(TaskCode.ERR_SIGNIN_NOT_FOUND, "");
            } //일치하는 계정이 없음
            else {
                onFinish(TaskCode.ERR_DATABASE_UNKNOWN, "");
            } //알수없는 오류
        });
    }
    //기타 작업 시 세션ID 인증 함수
    static AuthSession(SessionID, onFinish) {
        app_1.Database.query(`SELECT * FROM authusers WHERE SessionID=${app_1.Database.escape(SessionID)};`, (err, rows, fields) => {
            if (!err && rows.length == 1) { //DB 오류가 없다면
                var CreatedSessionID = security_1.default.CreateSessionID();
                app_1.Database.query(`UPDATE authusers SET SessionID='${CreatedSessionID}' WHERE SessionID=${app_1.Database.escape(SessionID)};`, (err, rows, fields) => {
                    if (!err) { //새로운 세션 ID 발급 시
                        onFinish(TaskCode.SUCCESS_WORK, CreatedSessionID);
                    }
                    else {
                        onFinish(TaskCode.ERR_SESSION_REGEN_FAILED, "");
                    }
                });
            }
            else if (rows.length == 0 || rows.length > 1) {
                onFinish(TaskCode.ERR_SESSION_AUTH_FAILED, "");
            } //일치하는 계정을 찾을 수 없음
            else {
                onFinish(TaskCode.ERR_DATABASE_UNKNOWN, "");
            } //DB 오류가 있다면
        });
    }
    //기록 추가
    static InsertRecord(myStaticID, records, onFinish) {
        var QueryValues = "";
        records.forEach((it) => {
            QueryValues = QueryValues + `(${app_1.Database.escape(myStaticID)}, ${app_1.Database.escape(it)}, '${moment_1.default(new Date()).tz("Asia/Seoul").format("YYYY-MM-DD")}'),`; //KST TIMEZONE
        });
        QueryValues = QueryValues.slice(0, -1) + ";"; //마지막 ,를 ;로 변경
        app_1.Database.query(`INSERT INTO scanchains(ScannerStaticID, ScanedDynamicUUID, ContactDayWithoutTime) VALUES ${QueryValues}`, (err, rows, fields) => {
            console.log(err);
            if (!err) {
                onFinish(TaskCode.SUCCESS_WORK); //INSERT 성공
            }
            else {
                onFinish(TaskCode.ERR_DATABASE_UNKNOWN);
            } //INSERT 중 오류 발생 시
        });
    }
    //확진자 접촉여부 검색
    static SearchRecord(myStaticID, onFinish) {
        app_1.Database.query(`SELECT * FROM scanchains WHERE ScannerStaticID=${app_1.Database.escape(myStaticID)};`, (err, rows_my, fields) => {
            if (!err) { //확진자들 리스트에서 유저가 스캔했던 UUID를 보유한 확진자들을 전부 불러옴
                if (rows_my.length == 0) {
                    onFinish(TaskCode.SUCCESS_WORK, [], []);
                } //스캔 기록 자체가 없을 때
                else {
                    var myscanedUUIDlist = rows_my.map((it) => { return it.ScanedDynamicUUID; });
                    app_1.Database.query(`SELECT * FROM infectedpersons WHERE PersonUUID IN (?)`, myscanedUUIDlist, (err, rows, fields) => {
                        console.log(err);
                        if (!err) {
                            var contactedUUID = rows.map((it) => { return it.PersonUUID; });
                            var contactedDate = rows_my.map((it) => { return it.ContactDayWithoutTime; });
                            onFinish(TaskCode.SUCCESS_WORK, contactedUUID, contactedDate); //값 반환
                        }
                        else {
                            onFinish(TaskCode.ERR_DATABASE_UNKNOWN, [], []);
                        }
                    });
                }
            }
            else {
                onFinish(TaskCode.ERR_DATABASE_UNKNOWN, [], []);
            }
        });
    }
    //확진자 추가
    static InsertInfection(Records, GovermentEmail, GovermentID, PhoneLastNumber, onFinish) {
        var QueryValues = Records.map((it) => `(${app_1.Database.escape(it)}, ${app_1.Database.escape(GovermentID)}, ${app_1.Database.escape(PhoneLastNumber)}, ${app_1.Database.escape(GovermentEmail)})`);
        console.log(`INSERT INTO infectedpersons(PersonUUID, GovermentID, PhoneLastNumber, GovermentEMAIL) VALUES ${QueryValues.join(",")}`);
        app_1.Database.query(`INSERT INTO infectedpersons(PersonUUID, GovermentID, PhoneLastNumber, GovermentEMAIL) VALUES ${QueryValues.join(",")}`, (err, rows, fields) => {
            if (!err) {
                onFinish(TaskCode.SUCCESS_WORK);
            }
            else {
                onFinish(TaskCode.ERR_DATABASE_UNKNOWN);
            }
        });
    }
}
exports.dbFunctions = dbFunctions;
//데이터베이스 관련 작업 결과 코드
var TaskCode;
(function (TaskCode) {
    //성공시
    TaskCode[TaskCode["SUCCESS_WORK"] = 0] = "SUCCESS_WORK";
    //범용 데이터베이스 오류
    TaskCode[TaskCode["ERR_DATABASE_NOT_CONNECT"] = 1] = "ERR_DATABASE_NOT_CONNECT";
    TaskCode[TaskCode["ERR_DATABASE_UNKNOWN"] = 2] = "ERR_DATABASE_UNKNOWN";
    TaskCode[TaskCode["ERR_INVALID_VALUE"] = 3] = "ERR_INVALID_VALUE";
    //회원가입 및 로그인 오류
    TaskCode[TaskCode["ERR_SIGNUP_EXISTS_ACCOUNT"] = 4] = "ERR_SIGNUP_EXISTS_ACCOUNT";
    TaskCode[TaskCode["ERR_SIGNIN_NOT_FOUND"] = 5] = "ERR_SIGNIN_NOT_FOUND";
    TaskCode[TaskCode["ERR_SIGNIN_NOT_EQUAL_PW"] = 6] = "ERR_SIGNIN_NOT_EQUAL_PW";
    //세션ID 관련 오류
    TaskCode[TaskCode["ERR_SESSION_AUTH_FAILED"] = 7] = "ERR_SESSION_AUTH_FAILED";
    TaskCode[TaskCode["ERR_SESSION_REGEN_FAILED"] = 8] = "ERR_SESSION_REGEN_FAILED";
    TaskCode[TaskCode["ERR_SESSION_TIME_OVER"] = 9] = "ERR_SESSION_TIME_OVER"; //세션ID 유효 기간이 초과했을 때(아직 미사용하는 ID)
})(TaskCode || (TaskCode = {}));
exports.TaskCode = TaskCode;
//# sourceMappingURL=dbFunctions.js.map