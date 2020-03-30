/*
    Fermata Server
    데이터베이스 접근 함수들(이곳에서만 sql 문 호출할 것)
*/

//import modules
import {Database} from "./app"
import Security from "./security"

class dbFunctions{

    //회원가입 쿼리
    static Signup(ID:string, Password:string, onFinish:(code:dbCode) => any){
        Database.query(`SELECT * FROM authusers WHERE ID=${Database.escape(ID)};`, (err, rows, fields) => {
            if(!err && rows.size == 0){ //오류가 없고 일치하는 ID가 없다면
                var Salt = Security.CreateSalt()
                Database.query(`INSERT INTO authusers(ID, HashedPassword, Salt)
                VALUES(${Database.escape(ID)}, '${Security.EncryptPassword(Password, Salt)}', '${Salt}')`, (err, rows, fields) => {
                    if(!err){ //오류가 없다면
                        onFinish(dbCode.SUCCESS_WORK)   
                    }else{ //오류 발생 시
                        onFinish(dbCode.ERR_DATABASE_UNKNOWN)
                    }
                })
            }else{onFinish(dbCode.ERR_SIGNUP_EXISTS_ACCOUNT)} //일치하는 ID가 이미 있다면
        })
    }

    //로그인 쿼리
    static Signin(ID:string, Password:string, onFinish:(code:dbCode) => any){

    }

    //기타 작업 시 세션인증 함수
    static AuthSession(SessionID:string, onFinish:(code:dbCode, newSessionID:string) => any){

    }


}

enum dbCode{
    //성공시
    SUCCESS_WORK, //데이터베이스 쿼리가 정상적으로 작동했을 때

    //범용 데이터베이스 오류
    ERR_DATABASE_NOT_CONNECT, //데이터베이스 연결이 안될 때
    ERR_DATABASE_UNKNOWN, //알려지지 않은 오류
    ERR_INVALID_VALUE, //올바르지 않은 입력값

    //회원가입 및 로그인 오류
    ERR_SIGNUP_EXISTS_ACCOUNT, //회원가입 시 계정이 이미 존재할 때
    ERR_SIGNIN_NOT_FOUND, //로그인 시 계정이 없을 때
    ERR_SIGNIN_NOT_EQUAL_PW //로그인 시 페스워드가 불일치 할 때
}

export {dbCode, dbFunctions}