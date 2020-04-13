/*
    Fermata Server
    코로나19 실시간 접촉자 확인알림서비스 서버
*/

//Import Modules
import express from "express"
import mysql from "mysql"
import ejs from "ejs"
import path from "path"
import https from "https"
import fs from "fs"
import {watchu, watchuUser, watchuPermission} from "./watchu"

//Initialize Settings
const Database = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PW,
    port : 3306, // 기본 포트
    database : process.env.DB_NAME
})
Database.connect()

const App = express()
App.use(express.static(path.join(__dirname, '../static')))
App.use(express.json())
App.use(express.urlencoded({extended:false}))
App.set('views', path.join(__dirname, '../views')) // html 동적 파일 위치
App.set('view engine', 'ejs')
App.engine('html', ejs.renderFile)

//Setting Express API Router
import RT_introduce from "./routers/introduce"
import API_USER from "./routers/api/user"
import API_RECORD from "./routers/api/record"
App.use('/introduce', RT_introduce) //추후 삭제 예정
App.use('/api/user', API_USER)
App.use('/api/record', API_RECORD)
App.get("/", (req, res) => { //안내화면
    res.send("<h1>Fermata API Server</h1><br><p>DEVELOPED BY LISBON</p>")
})

//watchu 활성화
const watchuApp = new watchu("localhost", 9503, process, watchu.getUsersFromObj([ //사용자 설정파일(추후 배포시 환경변수로 불러올 것)
    {id:"admin", pw:"testpw", permissions:[watchuPermission.PERMISSION_ADMIN]} //ADMIN 테스트
]))
watchuApp.start()

//Start Server
App.listen(process.env.PORT || 80) //HTTP
try{
    const SSLsetting = {
        key:fs.readFileSync(process.env.SSL_KEY!!),
        cert:fs.readFileSync(process.env.SSL_CERT!!)
    }
    https.createServer(SSLsetting, App).listen(443) //HTTPS
}catch(ex){
    console.log("HTTPS Server Create Failed")
}

//Export variables
export {Database}