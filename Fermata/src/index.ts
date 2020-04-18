/*
    Fermata Server
    코로나19 실시간 접촉자 확인알림서비스 서버
*/

//Import Modules
import mysql from "mysql"

//import * as serverless from "serverless-http";
import express from "express"

import path from "path"
import ejs from "ejs"
//Initialize Settings
var Database: mysql.Connection ;
import request from "./request"

import response from "./response"

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
App.get("/", (req, res) => { //안내화면
    res.send("<h1>Fermata API Server</h1><br><p>DEVELOPED BY LISBON</p>")
})

//Start Server
/*
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
*/
//Export variables
function main(input:any ){

   
    const method = input.method;
     const remoteAddress = "1.1.1.1";
    const headers =input.__ow_headers;
    delete input.__ow_headers;


       
    if(Database==null) {
        Database= mysql.createConnection(input.db)
        Database.connect();
        }
     
        
    return new Promise((s,j)=>{
        var req ;
        if(input.path)  input.path=input.path.replace("\\",""); 
        if(input.path=="user"){

            req = new request({
                method:method,
                headers:headers,
                body:input,
                remoteAddress:remoteAddress,
                url: "/",
              });
              
        
            API_USER(  req ,  new response( (result: any)=>{

                s(result);

            } )
            , ()=>{} )
            
        }       
        else if(input.path=="record") {

            req= new request({
                method: method,
                headers: headers,
                body: input,
                remoteAddress: remoteAddress,
                url: "/",
            });
            API_RECORD(req, new response((result:any) => {
                s(result);
                
            }), () => { });
        } else if(input.path=="records/infection"){

            req= new request({
                method: method,
                headers: headers,
                body: input,
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

export {Database,main}
