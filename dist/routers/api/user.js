"use strict";
/*
    Fermata Server
    API 처리 라우터
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Import Modules
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
//회원가입
router.put("/", (req, res) => {
    console.log(req.body);
});
//로그인
router.post("/", (req, res) => {
});
exports.default = router;
//# sourceMappingURL=user.js.map