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
class dbFunctions {
    //회원가입 쿼리
    static Signup(ID, Password, onFinish) {
        app_1.Database.query(`SELECT * FROM authusers WHERE ID=${app_1.Database.escape(ID)};`, (err, rows, fields) => {
            if (!err && rows.size == 0) { //오류가 없고 일치하는 ID가 없다면
                var Salt = security_1.default.CreateSalt();
                app_1.Database.query(`INSERT INTO authusers(ID, HashedPassword, Salt, SessionID, SignupDate)
                VALUES(${app_1.Database.escape(ID)}, '${security_1.default.EncryptPassword(Password, Salt)}', '${Salt}', '', NOW())`, (err, rows, fields) => {
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
            if (!err && rows.size == 1) {
                var FoundUser = rows[0];
                var LoginResult = (FoundUser.HashedPassword == security_1.default.EncryptPassword(Password, FoundUser.Salt));
                if (LoginResult) { //로그인 성공 시
                    var SessionID = security_1.default.CreateSessionID();
                    app_1.Database.query(`UPDATE authusers SET SessionID='${SessionID}' WHERE ID=${app_1.Database.escape(ID)};`, (err, rows, fields) => {
                        if (!err) { //새로운 세션 ID 발급 시
                            onFinish(TaskCode.SUCCESS_WORK, SessionID);
                        }
                        else {
                            onFinish(TaskCode.ERR_SESSION_REGEN_FAILED, "");
                        }
                    });
                    onFinish(TaskCode.SUCCESS_WORK, "새로운 세션ID");
                }
                else if (!LoginResult) { //페스워드가 틀릴 경우(* 경고 : 페스워드 오류와 일치하는 계정 없음 오류는 보안을 위해 클라이언트에서 하나의 오류로 표시할 것!)
                    onFinish(TaskCode.ERR_SIGNIN_NOT_EQUAL_PW, "");
                }
                else {
                    onFinish(TaskCode.ERR_DATABASE_UNKNOWN, "");
                } //알 수 없는 오류
            }
            else if (rows.size > 1) {
                onFinish(TaskCode.ERR_SIGNIN_NOT_FOUND, "");
            } //일치하는 계정이 없음
            else {
                onFinish(TaskCode.ERR_DATABASE_UNKNOWN, "");
            } //알수없는 오류
        });
    }
    //기타 작업 시 세션인증 함수
    static AuthSession(SessionID, onFinish) {
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