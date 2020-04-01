/*
    Fermata Server
    코로나19 실시간 접촉자 확인알림서비스 서버
*/

//Import Modules
import express from "express"
import mysql from "mysql"
import ejs from "ejs"
import path from "path"

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
App.use('/introduce', RT_introduce)
App.use('/api/user', API_USER)
App.use('/api/record', API_RECORD)

//Start Server
App.listen(process.env.PORT || 80)

//Export variables
export {Database}