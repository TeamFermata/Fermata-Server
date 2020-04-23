/*
    Fermata Server
    API 처리 라우터 / 기록 관리
*/

//Import Modules
import {dbFunctions, TaskCode} from "./../../dbFunctions"
import express from "express"
import ejs from "ejs"
import path from "path"
import mailer from "nodemailer"

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
                console.log("코드 : " + Code)
                switch(Code){
                    case TaskCode.SUCCESS_WORK :
                        //인증 이메일 전송
                        console.log("인증 성공")
                        const time = Date.now();
                        var CloudSetting=req.body.SMTP
                        ejs.renderFile(path.join(__dirname, "../../../views/AuthMail.ejs"),
                        {PersonGovermentID:req.body.numstr, lastPhoneNumber:req.body.pnumstr, AuthIDWithAPIaddr:`https://nopd4pibsh.apigw.ntruss.com/API/prod/rivykMwR3e/json/api/infection?AUTHID=${AuthID}`},
                        {}, (err, renderedHtml:string) => {
                            console.log("렌더링 오류" + err) //ejs 렌더링 오류 디버깅
                            if(!err){
                                //SMTP 사용(실험용, nodemailer)
                                mailer.createTransport({
                                    host:process.env.SMTP_HOST || CloudSetting.SMTP_HOST || "smtp.gmail.com",
                                    port:465,
                                    secure:true,
                                    auth:{
                                        user:process.env.SMTP_USER || CloudSetting.SMTP_USER,
                                        pass:process.env.SMTP_PW || CloudSetting.SMTP_PW
                                    }
                                }).sendMail({
                                    from:process.env.SMTP_USER || CloudSetting.SMTP_USER,
                                    to:req.body.email,
                                    subject:"[Fermata] COVID-19 확진자 인증 시스템",
                                    html:renderedHtml
                                }, (err, info) => {
                                    if(!err) {
                                        console.log('Email sent: ' + info.response)
                                        res.send({"code":"success", "newSessionID":newSessionID})
                                    }else{
                                        console.log(err)
                                        res.send({"code":"fail_unknown_email"})
                                    }
                                })
                            }else{res.send({"code":"fail_rendermail"})}
                        })
                        break
                    case TaskCode.ERR_DATABASE_UNKNOWN :
                        res.send({"code":"fail_sql"})
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
        res.set("Content-Type", "text/html")
        switch(code){
            case TaskCode.SUCCESS_WORK :
                res.send("<script>alert('작업이 처리되었습니다');self.close();</script>")
                break
            default :
                res.send("<script>alert('오류 발생, 관리자에게 문의하세요');self.close();</script>")
                break
        }
    })
})

export default router