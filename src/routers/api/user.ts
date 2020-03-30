/*
    Fermata Server
    API 처리 라우터
*/

//Import Modules
import {dbFunctions, dbCode} from "./../../dbFunctions"
import express from "express"
const router = express.Router()

//회원가입
router.put("/", (req, res) => {
    console.log(req.body) //개발 시 값 확인 용도
    if(typeof req.body === "object" && req.body.id != null && req.body.password != null){
        dbFunctions.Signup(req.body.id, req.body.password, (code:dbCode) => {
            switch(code){
                case dbCode.SUCCESS_WORK :
                    
                    break
                case dbCode.ERR_SIGNUP_EXISTS_ACCOUNT :

                    break
                default :

                    break
            }
        })   
    }
})

//로그인
router.post("/", (req, res) => {
    dbFunctions.Signin(req.body.id, req.body.password, (code:dbCode) => {
        
    })   
})

export default router