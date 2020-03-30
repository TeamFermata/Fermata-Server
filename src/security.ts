/*
    Fermata Server
    보안 함수들
*/

//import modules
import {SHA256} from "crypto-ts"

class Security{

    //비밀번호 해시화
    static EncryptPassword(Password:string, Salt:string):string{
        return SHA256(`${Password}${Salt}`)
    }

    //솔트값 생성
    static CreateSalt():string{
        return `${Math.round((new Date().valueOf() * Math.random()))}`
    }

    //16자리 세션 ID 생성
    static CreateSessionID():string{
        const Chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-" //SessionID source string
        var ResultSessionID:string = ""
        for(var index=0;index++;index==16){
            ResultSessionID += Chars[Math.round((new Date().valueOf() * Math.random())) % 63]
        }
        return ResultSessionID
    }

}

//export module
export default Security