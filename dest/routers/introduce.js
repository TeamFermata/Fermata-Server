"use strict";
/*
    Fermata Server
    서비스 소개 화면
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Import Modules
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
//소개 화면 요청이 있을 때
router.get("/", (req, res) => {
    res.render("introduce.ejs");
});
exports.default = router;
//# sourceMappingURL=introduce.js.map