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
        if(code == TaskCode.SUCCESS_WORK && req.body.myID != null && req.body.record != null){ //인증을 성공하고 내용이 있다면
            dbFunctions.InsertRecord(req.body.myID, req.body.record, (code) => {
                switch(code){
                    case TaskCode.SUCCESS_WORK : //등록 성공 시
                        res.send({"code":"success", "newSessionID":newSessionID})
                        break
                    default : //등록 실패 시
                        res.send({"code":"fail_unknown"})
                        break
                }
            })
        }else if(code == TaskCode.ERR_SESSION_AUTH_FAILED){res.send({"code":"fail_auth"})} //인증 실패
        else if(code == TaskCode.ERR_SESSION_REGEN_FAILED){res.send({"code":"fail_regen"})} //ID 생성 실패
        else{res.send({"code":"fail_unknown"})}
    })
})

//확진자 검색
router.post("/", (req, res) => {
    dbFunctions.AuthSession(req.body.sessionID != null ? req.body.sessionID : "", (code:TaskCode, newSessionID:String) => {
        if(code == TaskCode.SUCCESS_WORK && req.body.myID != null){ //인증 성공 시
            dbFunctions.SearchRecord(req.body.myID, (code:TaskCode, foundUUID:Array<string>, foundDate:Array<string>) => {
                switch(code){
                    case TaskCode.SUCCESS_WORK : //등록 성공 시
                        res.send({"code":"success", "newSessionID":newSessionID, "contacts":foundUUID, "contactDates":foundDate})
                        break
                    default : //등록 실패 시
                        res.send({"code":"fail_unknown"})
                        break
                }
            })
        }else if(code == TaskCode.ERR_SESSION_AUTH_FAILED){res.send({"code":"fail_auth"})}
        else if(code == TaskCode.ERR_SESSION_REGEN_FAILED){res.send({"code":"fail_regen"})}
        else{res.send({"code":"fail_unknown"})}
    })
})

//확진자 등록
router.put("/infection", (req, res) => {
    dbFunctions.AuthSession(req.body.sessionID != null ? req.body.sessionID : "", (code:TaskCode, newSessionID:String) => {
        if(code == TaskCode.SUCCESS_WORK){ //인증 성공 시

        }else if(code == TaskCode.ERR_SESSION_AUTH_FAILED){res.send({"code":"fail_auth"})}
        else if(code == TaskCode.ERR_SESSION_REGEN_FAILED){res.send({"code":"fail_regen"})}
        else{res.send({"code":"fail_unknown"})}
    })
})

export default router