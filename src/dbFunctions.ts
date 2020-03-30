/*
    Fermata Server
    데이터베이스 접근 함수들(이곳에서만 sql 문 호출할 것)
*/

//import modules
import {Database} from "./app"
import Security from "./security"

class dbFunctions{

    //회원가입 쿼리
    static Signup(ID:string, Password:string, onFinish:(code:TaskCode) => any){
        Database.query(`SELECT * FROM authusers WHERE ID=${Database.escape(ID)};`, (err, rows, fields) => {
            if(!err && rows.size == 0){ //오류가 없고 일치하는 ID가 없다면
                var Salt = Security.CreateSalt()
                Database.query(`INSERT INTO authusers(ID, HashedPassword, Salt, SessionID, SignupDate)
                VALUES(${Database.escape(ID)}, '${Security.EncryptPassword(Password, Salt)}', '${Salt}', '', NOW())`, (err, rows, fields) => {
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
            if(!err && rows.size == 1){
                var FoundUser = rows[0]
                var LoginResult:boolean = (FoundUser.HashedPassword == Security.EncryptPassword(Password, FoundUser.Salt))
                if(LoginResult){ //로그인 성공 시
                    var SessionID:string = Security.CreateSessionID()
                    Database.query(`UPDATE authusers SET SessionID='${SessionID}' WHERE ID=${Database.escape(ID)};`, (err, rows, fields) => {
                        if(!err){ //새로운 세션 ID 발급 시
                            onFinish(TaskCode.SUCCESS_WORK, SessionID)
                        }else{onFinish(TaskCode.ERR_SESSION_REGEN_FAILED, "")}
                    })
                    onFinish(TaskCode.SUCCESS_WORK, "새로운 세션ID")
                }else if(!LoginResult){ //페스워드가 틀릴 경우(* 경고 : 페스워드 오류와 일치하는 계정 없음 오류는 보안을 위해 클라이언트에서 하나의 오류로 표시할 것!)
                    onFinish(TaskCode.ERR_SIGNIN_NOT_EQUAL_PW, "")
                }
                else{onFinish(TaskCode.ERR_DATABASE_UNKNOWN, "")} //알 수 없는 오류
            }else if(rows.size > 1){onFinish(TaskCode.ERR_SIGNIN_NOT_FOUND, "")} //일치하는 계정이 없음
            else{onFinish(TaskCode.ERR_DATABASE_UNKNOWN, "")} //알수없는 오류
        })
    }

    //기타 작업 시 세션인증 함수
    static AuthSession(SessionID:string, onFinish:(code:TaskCode, newSessionID:string) => any){

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