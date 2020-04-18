/*
    Fermata Server
    API 처리 라우터 / 기록 관리
*/

//Import Modules
import {dbFunctions, TaskCode} from "./../../dbFunctions"
import express from "express"
import ejs from "ejs"
import path from "path"
import request from "request"
import Security from "../../security"

const router = express.Router()

//접촉 기록 추가
router.put("/", (req, res) => {
    dbFunctions.AuthSession(req.body.sessionID != null ? req.body.sessionID : "", (code:TaskCode, newSessionID:String) => {
        if(code == TaskCode.SUCCESS_WORK){ //인증을 성공하고 내용이 있다면
            console.log("BEFORE INSERT RECORD : " + code + "")
            dbFunctions.InsertRecord(req.body.myID, req.body.record, (code) => {
                console.log("INSERT RECORD : " + code + "")
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
            dbFunctions.InsertInfection(req.body.record, req.body.email, req.body.numstr, req.body.pnumstr, (Code:TaskCode, AuthID:string) => { //확진자 등록
                switch(Code){
                    case TaskCode.SUCCESS_WORK :
                        //인증 이메일 전송
                        const time = Date.now();
                        var CloudSetting=req.body.API;
                        ejs.renderFile(path.join(__dirname, "/views/AuthMail.ejs"),
                        {PersonGovermentID:req.body.numstr, lastPhoneNumber:req.body.pnumstr, AuthIDWithAPIaddr:`https://api.fermata.com/api/infection?AUTHID=${AuthID}`},
                        {}, (err, html:string) => {
                            if(!err){
                                const MailOptions = { //메일 전송
                                    uri: "https://mail.apigw.ntruss.com/api/v1/mails",
                                    method: "POST",
                                    headers: {
                                       "x-ncp-apigw-timestamp":`${time}`,
                                       "x-ncp-iam-access-key":`${process.env.NAVER_API_ACCESS_KEY || CloudSetting.ACCESSKEY}`,
                                       "x-ncp-apigw-signature-v2":`${Security.makeSignatureV2(time, process.env.NAVER_API_ACCESS_KEY || CloudSetting.ACCESSKEY,
                                        process.env.NAVER_API_SECRET_KEY || CloudSetting.SECRETKEY)}`,
                                       "x-ncp-lang":"en-US"
                                    },
                                    body:{
                                        "senderAddress":"noreply@fermata.site",
                                        "title":"[Fermata] COVID-19 확진자 확인 시스템",
                                        "body":html,
                                        "recipients":[
                                            {"address":req.body.email, "name":"대한민국 정부 COVID-19 방역담당자", "type":"R"}
                                        ]
                                    },
                                    json:true
                                }
                                request.post(MailOptions, (err, httpResponse, body) => {
                                    if(!err){res.send({"code":"success", "newSessionID":newSessionID})}else{
                                        res.send({"code":"fail_unknown"})
                                    }
                                })
                            }else{res.send({"code":"fail_unknown"})}
                        })
                        break
                    default :
                        res.send({"code":"fail_unknown"})
                        break
                }
            })
        }else if(code == TaskCode.ERR_SESSION_AUTH_FAILED){res.send({"code":"fail_auth"})}
        else if(code == TaskCode.ERR_SESSION_REGEN_FAILED){res.send({"code":"fail_regen"})}
        else{res.send({"code":"fail_unknown"})}
    })
})

//확진자 인증(for email)
router.get("/infection", (req, res) => {
    dbFunctions.AuthInfection(req.params.AUTHID, (code:TaskCode) => {
        
    })
})

export default router