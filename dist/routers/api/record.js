"use strict";
/*
    Fermata Server
    API 처리 라우터 / 기록 관리
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Import Modules
const dbFunctions_1 = require("./../../dbFunctions");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
//접촉 기록 추가
router.put("/", (req, res) => {
    dbFunctions_1.dbFunctions.AuthSession(req.body.sessionID != null ? req.body.sessionID : "", (code, newSessionID) => {
        if (code == dbFunctions_1.TaskCode.SUCCESS_WORK) { //인증을 성공하고 내용이 있다면
            console.log("BEFORE INSERT RECORD : " + code + "");
            dbFunctions_1.dbFunctions.InsertRecord(req.body.myID, req.body.record, (code) => {
                console.log("INSERT RECORD : " + code + "");
                switch (code) {
                    case dbFunctions_1.TaskCode.SUCCESS_WORK: //등록 성공 시
                        res.send({ "code": "success", "newSessionID": newSessionID });
                        break;
                    default: //등록 실패 시
                        res.send({ "code": "fail_unknown" });
                        break;
                }
            });
        }
        else if (code == dbFunctions_1.TaskCode.ERR_SESSION_AUTH_FAILED) {
            res.send({ "code": "fail_auth" });
        } //인증 실패
        else if (code == dbFunctions_1.TaskCode.ERR_SESSION_REGEN_FAILED) {
            res.send({ "code": "fail_regen" });
        } //ID 생성 실패
        else {
            res.send({ "code": "fail_unknown" });
        }
    });
});
//확진자 검색
router.post("/", (req, res) => {
    dbFunctions_1.dbFunctions.AuthSession(req.body.sessionID != null ? req.body.sessionID : "", (code, newSessionID) => {
        if (code == dbFunctions_1.TaskCode.SUCCESS_WORK && req.body.myID != null) { //인증 성공 시
            dbFunctions_1.dbFunctions.SearchRecord(req.body.myID, (code, foundUUID, foundDate) => {
                switch (code) {
                    case dbFunctions_1.TaskCode.SUCCESS_WORK: //등록 성공 시
                        res.send({ "code": "success", "newSessionID": newSessionID, "contacts": foundUUID, "contactDates": foundDate });
                        break;
                    default: //등록 실패 시
                        res.send({ "code": "fail_unknown" });
                        break;
                }
            });
        }
        else if (code == dbFunctions_1.TaskCode.ERR_SESSION_AUTH_FAILED) {
            res.send({ "code": "fail_auth" });
        }
        else if (code == dbFunctions_1.TaskCode.ERR_SESSION_REGEN_FAILED) {
            res.send({ "code": "fail_regen" });
        }
        else {
            res.send({ "code": "fail_unknown" });
        }
    });
});
//확진자 등록
router.put("/infection", (req, res) => {
    dbFunctions_1.dbFunctions.AuthSession(req.body.sessionID != null ? req.body.sessionID : "", (code, newSessionID) => {
        if (code == dbFunctions_1.TaskCode.SUCCESS_WORK) { //인증 성공 시
        }
        else if (code == dbFunctions_1.TaskCode.ERR_SESSION_AUTH_FAILED) {
            res.send({ "code": "fail_auth" });
        }
        else if (code == dbFunctions_1.TaskCode.ERR_SESSION_REGEN_FAILED) {
            res.send({ "code": "fail_regen" });
        }
        else {
            res.send({ "code": "fail_unknown" });
        }
    });
});
exports.default = router;
//# sourceMappingURL=record.js.map