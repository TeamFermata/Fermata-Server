"use strict";
/*
    Fermata Server
    보안 함수들
*/
Object.defineProperty(exports, "__esModule", { value: true });
//import modules
const crypto_ts_1 = require("crypto-ts");
class Security {
    //비밀번호 해시화
    static EncryptPassword(Password, Salt) {
        return crypto_ts_1.SHA256(`${Password}${Salt}`);
    }
    //솔트값 생성
    static CreateSalt() {
        return `${Math.round((new Date().valueOf() * Math.random()))}`;
    }
    //16자리 세션 ID 생성
    static CreateSessionID() {
        const Chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-"; //SessionID source string
        var ResultSessionID = "";
        for (var index = 0; index++; index == 16) {
            ResultSessionID += Chars[Math.round((new Date().valueOf() * Math.random())) % 63];
        }
        return ResultSessionID;
    }
}
//export module
exports.default = Security;
//# sourceMappingURL=security.js.map