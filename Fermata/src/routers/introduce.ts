/*
    Fermata Server
    서비스 소개 화면
*/

//Import Modules
import express from "express"
const router = express.Router()

//소개 화면 요청이 있을 때
router.get("/", (req, res) => {
    res.render("introduce.ejs")
})


export default router