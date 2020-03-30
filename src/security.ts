/*
    Fermata Server
    보안 함수들
*/

//import modules
import {SHA256} from "crypto-ts"

class Security{

    //비밀번호 해시화
    static EncryptPassword(Password:string, Hash:string):string{
        return SHA256(`${Password}${Hash}`)
    }

    //솔트값 생성
    static CreateSalt():string{
        return `${Math.round((new Date().valueOf() * Math.random()))}`
    }

}

//export module
export default Security