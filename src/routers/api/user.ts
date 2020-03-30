/*
    Fermata Server
    API 처리 라우터
*/

//Import Modules
import {dbFunctions, TaskCode} from "./../../dbFunctions"
import express from "express"
const router = express.Router()

//회원가입
router.put("/", (req, res) => {
    console.log(req.body) //개발 시 값 확인 용도
    if(typeof req.body === "object" && req.body.id != null && req.body.password != null){
        dbFunctions.Signup(req.body.id, req.body.password, (code:TaskCode) => {
            switch(code){
                case TaskCode.SUCCESS_WORK :
                    res.send({"code":"success"})
                    break
                case TaskCode.ERR_SIGNUP_EXISTS_ACCOUNT :
                    res.send({"code":"fail_exists"})
                    break
                default :
                    res.send({"code":"fail_unknown"})
                    break
            }
        })   
    }else{res.send({"code":"fail_unknown"})}
})

//로그인
router.post("/", (req, res) => {
    if(typeof req.body === "object" && req.body.id != null && req.body.password != null){
        dbFunctions.Signin(req.body.id, req.body.password, (code:TaskCode, newSessionID:string) => {
            switch(code){
                case TaskCode.SUCCESS_WORK :
                    res.send({"code":"success", "sessionID":newSessionID})
                    break
                case TaskCode.ERR_SIGNIN_NOT_FOUND : //계정이 없을 때
                    res.send({"code":"fail_not_found"})
                    break
                case TaskCode.ERR_SIGNIN_NOT_EQUAL_PW : //비밀번호가 틀릴 때
                    res.send({"code":"fail_invalidpw"})
                    break
                default :
                    res.send({"code":"fail_unknown"}) //알 수 없는 오류
                    break
            }
        })
    }else{res.send({"code":"fail_unknown"})}
})

export default router