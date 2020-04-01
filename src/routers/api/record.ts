/*
    Fermata Server
    API 처리 라우터 / 기록 관리
*/

//Import Modules
import {dbFunctions, TaskCode} from "./../../dbFunctions"
import express from "express"
const router = express.Router()

//접촉 기록 추가
router.put("/", (req, res) => {
    dbFunctions.AuthSession(req.body.sessionID != null ? req.body.sessionID : "", (code:TaskCode, newSessionID:String) => {
        if(code == TaskCode.SUCCESS_WORK){

        }else if(code == TaskCode.ERR_SESSION_AUTH_FAILED){res.send({"code":"fail_auth"})}
        else if(code == TaskCode.ERR_SESSION_REGEN_FAILED){res.send({"code":"fail_regen"})}
        else{res.send({"code":"fail_unknown"})}
    })
})

//확진자 검색
router.post("/", (req, res) => {

})

export default router