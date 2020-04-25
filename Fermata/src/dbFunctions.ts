/*
    Fermata Server
    데이터베이스 접근 함수들(이곳에서만 sql 문 호출할 것)
*/

//import modules
import {Database} from "./app"
import Security from "./security"
import momentJS from "moment"
import path from "path"
import "moment-timezone"
import ejs from "ejs"

class dbFunctions{

    //회원가입 쿼리
    static Signup(ID:string, Password:string, onFinish:(code:TaskCode) => any){
        Database.query(`SELECT * FROM authusers WHERE ID=${Database.escape(ID)};`, (err, rows, fields) => {
            if(!err && rows.length == 0){ //오류가 없고 일치하는 ID가 없다면
                var Salt = Security.CreateSalt()
                Database.query(`INSERT INTO authusers(ID, HashedPassword, Salt, SessionID, SignupDate)
                VALUES(${Database.escape(ID)}, '${Security.EncryptPassword(Password, Salt)}', '${Salt}', '', NOW());`, (err, rows, fields) => {
                    if(!err){ //오류가 없다면
                        onFinish(TaskCode.SUCCESS_WORK) //작업 완료
                    }else{ //오류 발생 시
                        onFinish(TaskCode.ERR_DATABASE_UNKNOWN) //알 수 없는 오류
                    }
                })
            }else{onFinish(TaskCode.ERR_SIGNUP_EXISTS_ACCOUNT)} //일치하는 ID가 이미 있다면
        })
    }

    //로그인 쿼리
    static Signin(ID:string, Password:string, onFinish:(code:TaskCode, newSessionID:string) => any){
        Database.query(`SELECT * FROM authusers WHERE ID=${Database.escape(ID)};`, (err, rows, fields) => {
            if(!err && rows.length == 1){
                var FoundUser = rows[0]
                var LoginResult:boolean = (FoundUser.HashedPassword == Security.EncryptPassword(Password, FoundUser.Salt))
                if(LoginResult){ //로그인 성공 시
                    var SessionID:string = Security.CreateSessionID()
                    Database.query(`UPDATE authusers SET SessionID='${SessionID}' WHERE ID=${Database.escape(ID)};`, (err, rows, fields) => {
                        if(!err){ //새로운 세션 ID 발급 시
                            onFinish(TaskCode.SUCCESS_WORK, SessionID)
                        }
                    })
                }else if(!LoginResult){ //페스워드가 틀릴 경우(* 경고 : 페스워드 오류와 일치하는 계정 없음 오류는 보안을 위해 클라이언트에서 하나의 오류로 표시할 것!)
                    onFinish(TaskCode.ERR_SIGNIN_NOT_EQUAL_PW, "")
                }
                else{onFinish(TaskCode.ERR_DATABASE_UNKNOWN, "")} //알 수 없는 오류
            }else if(rows.length > 1){onFinish(TaskCode.ERR_SIGNIN_NOT_FOUND, "")} //일치하는 계정이 없음
            else{onFinish(TaskCode.ERR_DATABASE_UNKNOWN, "")} //알수없는 오류
        })
    }

    //기타 작업 시 세션ID 인증 함수
    static AuthSession(SessionID:string, onFinish:(code:TaskCode, newSessionID:string) => any){
        Database.query(`SELECT * FROM authusers WHERE SessionID=${Database.escape(SessionID)};`, (err, rows, fields) => {
            if(!err && rows.length == 1){ //DB 오류가 없다면
                var CreatedSessionID = Security.CreateSessionID()
                Database.query(`UPDATE authusers SET SessionID='${CreatedSessionID}' WHERE SessionID=${Database.escape(SessionID)};`, (err, rows, fields) => {
                    if(!err){ //새로운 세션 ID 발급 시
                        onFinish(TaskCode.SUCCESS_WORK, CreatedSessionID)
                    }else{onFinish(TaskCode.ERR_SESSION_REGEN_FAILED, "")}
                })
            }else if(rows.length == 0 || rows.length > 1){onFinish(TaskCode.ERR_SESSION_AUTH_FAILED, "")} //일치하는 계정을 찾을 수 없음
            else{onFinish(TaskCode.ERR_DATABASE_UNKNOWN, "")} //DB 오류가 있다면
        })
    }

    //접촉 기록 추가
    static InsertRecord(myStaticID:string, records:Array<string>, onFinish:(code:TaskCode) => any){
        var QueryValues:string = ""
        records.forEach((it) => { 
            //베타테스트 버전이므로 Authed 필드에 1(true)를 넣어 자동인증 되도록 함(실제 출시 후 반드시 지울 것!)
            QueryValues = QueryValues + `(${Database.escape(myStaticID)}, ${Database.escape(it)}, '${momentJS(new Date()).tz("Asia/Seoul").format("YYYY-MM-DD")}', 1),` //KST TIMEZONE
        })
        QueryValues = QueryValues.slice(0, -1) + ";" //마지막 ,를 ;로 변경
        Database.query(`INSERT INTO scanchains(ScannerStaticID, ScanedDynamicUUID, ContactDayWithoutTime, Authed) VALUES ${QueryValues}`, (err, rows, fields) => {
            if(!err){
                onFinish(TaskCode.SUCCESS_WORK) //INSERT 성공
            }else{onFinish(TaskCode.ERR_DATABASE_UNKNOWN)} //INSERT 중 오류 발생 시
        })
    }

    //확진자 접촉여부 검색
    static SearchRecord(myStaticID:string, onFinish:(code:TaskCode, found_uuid:Array<string>, found_date:Array<string>) => any){
        Database.query(`SELECT * FROM scanchains WHERE ScannerStaticID=${Database.escape(myStaticID)} AND ContactDayWithoutTime > (NOW() - INTERVAL 1 MONTH);`, (err, rows_my, fields) => {
            if(!err){ //확진자들 리스트에서 유저가 스캔했던 접촉기록들을 전부 불러옴(단 한달 전부터 지금까지 있었던 기록만 가져옴)
                if(rows_my.length == 0){onFinish(TaskCode.SUCCESS_WORK, [], [])} //스캔 기록 자체가 없을 때
                else{
                    var myscanedUUIDlist:Array<string> = rows_my.map((it:any) => {return it.ScanedDynamicUUID})
                    Database.query(`SELECT * FROM infectedpersons WHERE Authed=1 AND PersonUUID IN (?)`, myscanedUUIDlist, (err, rows, fields) => {
                        if(!err){ //인증된 확진자들 중에서 만난 확진자가 있다면
                            var contactedUUID:Array<string> = rows.map((it:any) => {return it.PersonUUID})
                            var contactedDate:Array<string> = rows_my.map((it:any) => {return it.ContactDayWithoutTime})
                            onFinish(TaskCode.SUCCESS_WORK, contactedUUID, contactedDate) //값 반환
                        }else{onFinish(TaskCode.ERR_DATABASE_UNKNOWN, [], [])}
                    })
                }
            }else{onFinish(TaskCode.ERR_DATABASE_UNKNOWN, [], [])}
        })
    }

    //확진자 추가
    static InsertInfection(Records:Array<string>, GovermentEmail:string, GovermentID:string, PhoneLastNumber:string, onFinish:(code:TaskCode, AuthID:string) => any){
        var QueryValues:string[] = Records.map((it) => 
            `(${Database.escape(it)}, ${Database.escape(GovermentID)}, ${Database.escape(PhoneLastNumber)}, ${Database.escape(GovermentEmail)})`
        )
        const EmailAuthID = Security.CreateSessionID()
        Database.query(`INSERT INTO infectedpersons(PersonUUID, GovermentID, PhoneLastNumber, GovermentEMAIL) VALUES ${QueryValues.join(",")};`,
        (err, rows, fields) => { //확진자 등록
            console.log("오류 : " + err?.message + "\n" + err?.code + "\n" + err?.sqlMessage + "\n" + err?.sql) //SQL 디버그(작동 확인후 이 주석은 지우기)
            if(!err){
                Database.query(`INSERT INTO authinfect(EmailAuthID, GovermentID) VALUES('${EmailAuthID}', ${Database.escape(GovermentID)});`,
                (err, rows, fields) => { //이메일 링크 등록
                    console.log("오류 : " + err?.message + "\n" + err?.code + "\n" + err?.sqlMessage + "\n" + err?.sql) //SQL 디버그(작동 확인후 이 주석은 지우기)
                    if(!err){
                        onFinish(TaskCode.SUCCESS_WORK, EmailAuthID)
                    }else{onFinish(TaskCode.ERR_DATABASE_UNKNOWN, "")}
                })
            }else{onFinish(TaskCode.ERR_DATABASE_UNKNOWN, "")}
        })
    }

    //확진자 인증
    static AuthInfection(AuthID:string, onFinish:(code:TaskCode) => any){
        Database.query(`SELECT * FROM authinfect WHERE EmailAuthID=${Database.escape(AuthID)}`, (err, rows, fields) => { //인증 ID로 확진자들 ID 가져오기
            console.log(rows)
            if(!err && rows.length > 0){ //오류가 없다면
                Database.query(`UPDATE infectedpersons SET Authed=1 WHERE GovermentID='${rows[0].GovermentID}'`, (err, rows, fields) => { //확진자들 ID와 일치하는 확진자는 모두 인증 처리
                    if(!err){
                        onFinish(TaskCode.SUCCESS_WORK)
                    }else{onFinish(TaskCode.ERR_DATABASE_UNKNOWN)}
                })
            }else{onFinish(TaskCode.ERR_DATABASE_UNKNOWN)}
            console.log(err)
        })
    }

}

//데이터베이스 관련 작업 결과 코드
enum TaskCode{
    //성공시
    SUCCESS_WORK, //데이터베이스 쿼리가 정상적으로 작동했을 때

    //범용 데이터베이스 오류
    ERR_DATABASE_NOT_CONNECT, //데이터베이스 연결이 안될 때
    ERR_DATABASE_UNKNOWN, //알려지지 않은 오류
    ERR_INVALID_VALUE, //올바르지 않은 입력값

    //회원가입 및 로그인 오류
    ERR_SIGNUP_EXISTS_ACCOUNT, //회원가입 시 계정이 이미 존재할 때
    ERR_SIGNIN_NOT_FOUND, //로그인 시 계정이 없을 때
    ERR_SIGNIN_NOT_EQUAL_PW, //로그인 시 페스워드가 불일치 할 때

    //세션ID 관련 오류
    ERR_SESSION_AUTH_FAILED, //세션ID 인증이 실패했을 때
    ERR_SESSION_REGEN_FAILED, //세션ID 재발급이 실패했을 때
    ERR_SESSION_TIME_OVER //세션ID 유효 기간이 초과했을 때(아직 미사용하는 ID)
}

export {TaskCode, dbFunctions}