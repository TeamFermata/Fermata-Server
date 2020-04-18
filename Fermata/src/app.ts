/*
    Fermata Server
    코로나19 실시간 접촉자 확인알림서비스 서버 - 네이버 클라우드 Function
*/

//Import Modules
import mysql from "mysql"

//import * as serverless from "serverless-http";
import express from "express"

import path from "path"
import ejs from "ejs"

//Initialize Settings
var Database: mysql.Connection ;

//naver cloud function 자체 라이브러리 파일
import request from "./request1"
import response from "./response1"

const App = express()
App.use(express.static(path.join(__dirname, '../static')))
App.use(express.json())
App.use(express.urlencoded({extended:false}))
App.set('views', path.join(__dirname, '../views')) // html 동적 파일 위치
App.set('view engine', 'ejs')
App.engine('html', ejs.renderFile)

//Setting Express API Router

import API_USER from "./routers/api/user"
import API_RECORD from "./routers/api/record"

App.use('/api/user', API_USER)
App.use('/api/record', API_RECORD)
var CloudSetting:any = null

function main(CloudArgs:any){
    const method = CloudArgs.method;
    const remoteAddress = "1.1.1.1";
    const headers =CloudArgs.__ow_headers;
    delete CloudArgs.__ow_headers;


    CloudSetting = CloudArgs.API   
    if(Database==null) {
        Database= mysql.createConnection(CloudArgs.db)
        Database.connect();
        }
     
        
    return new Promise((s,j)=>{
        var req ;
        if(CloudArgs.path) CloudArgs.path=CloudArgs.path.replace("\\",""); 
        if(CloudArgs.path == "user"){

            req = new request({
                method:method,
                headers:headers,
                body:CloudArgs,
                remoteAddress:remoteAddress,
                url: "/",
              });
              
        
            API_USER(  req ,  new response( (result: any)=>{

                s(result);

            } )
            , ()=>{} )
            
        }       
        else if(CloudArgs.path=="record") {

            req= new request({
                method: method,
                headers: headers,
                body: CloudArgs,
                remoteAddress: remoteAddress,
                url: "/",
            });
            API_RECORD(req, new response((result:any) => {
                s(result);
                
            }), () => { });
        } else if(CloudArgs.path=="records/infection"){

            req= new request({
                method: method,
                headers: headers,
                body: CloudArgs,
                remoteAddress: remoteAddress,
                url: "/infection",
            });
            API_RECORD(req, new response((result:any) => {
                s(result);
            }), () => { });
            
        }
        
        else {   
            s({});
        }
    })
}

//Export variables
export {Database, main, CloudSetting}
