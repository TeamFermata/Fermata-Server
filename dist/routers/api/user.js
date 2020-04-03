"use strict";
/*
    Fermata Server
    API 처리 라우터 / 사용자 관리
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Import Modules
const dbFunctions_1 = require("./../../dbFunctions");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
//회원가입
router.put("/", (req, res) => {
    console.log(req.body); //개발 시 값 확인 용도
    if (typeof req.body === "object" && req.body.id != null && req.body.password != null) {
        dbFunctions_1.dbFunctions.Signup(req.body.id, req.body.password, (code) => {
            switch (code) {
                case dbFunctions_1.TaskCode.SUCCESS_WORK:
                    res.send({ "code": "success" });
                    break;
                case dbFunctions_1.TaskCode.ERR_SIGNUP_EXISTS_ACCOUNT:
                    res.send({ "code": "fail_exists" });
                    break;
                default:
                    res.send({ "code": "fail_unknown" });
                    break;
            }
        });
    }
    else {
        res.send({ "code": "fail_unknown" });
    }
});
//로그인
router.post("/", (req, res) => {
    if (typeof req.body === "object" && req.body.id != null && req.body.password != null) {
        dbFunctions_1.dbFunctions.Signin(req.body.id, req.body.password, (code, newSessionID) => {
            switch (code) {
                case dbFunctions_1.TaskCode.SUCCESS_WORK:
                    res.send({ "code": "success", "sessionID": newSessionID });
                    break;
                case dbFunctions_1.TaskCode.ERR_SIGNIN_NOT_FOUND: //계정이 없을 때
                    res.send({ "code": "fail_not_found" });
                    break;
                case dbFunctions_1.TaskCode.ERR_SIGNIN_NOT_EQUAL_PW: //비밀번호가 틀릴 때
                    res.send({ "code": "fail_invalidpw" });
                    break;
                default:
                    res.send({ "code": "fail_unknown" }); //알 수 없는 오류
                    break;
            }
        });
    }
    else {
        res.send({ "code": "fail_unknown" });
    }
});
exports.default = router;
//# sourceMappingURL=user.js.map