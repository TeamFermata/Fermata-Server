"use strict";
/*
    Fermata Server
    보안 함수들
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import modules
const crypto_js_1 = __importDefault(require("crypto-js"));
class Security {
    //비밀번호 해시화
    static EncryptPassword(Password, Salt) {
        return crypto_js_1.default.SHA256(`${Password}${Salt}`).toString(crypto_js_1.default.enc.Base64);
    }
    //솔트값 생성
    static CreateSalt() {
        return `${Math.round((new Date().valueOf() * Math.random()))}`;
    }
    //16자리 세션 ID 생성
    static CreateSessionID() {
        const Chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-"; //SessionID source string
        var ResultSessionID = "";
        for (let index = 0; index < 16; index++) {
            console.log(Chars[Math.round((new Date().valueOf() * Math.random())) % 63]);
            ResultSessionID += Chars[Math.round((new Date().valueOf() * Math.random())) % 63].toString();
        }
        return ResultSessionID;
    }
}
//export module
exports.default = Security;
//# sourceMappingURL=security.js.map