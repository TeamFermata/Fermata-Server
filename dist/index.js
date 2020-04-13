"use strict";
/*
    Fermata Server
    코로나19 실시간 접촉자 확인알림서비스 서버
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Import Modules
const mysql_1 = __importDefault(require("mysql"));
//import * as serverless from "serverless-http";
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
//Initialize Settings
var Database;
exports.Database = Database;
const request_1 = __importDefault(require("./request"));
const response_1 = __importDefault(require("./response"));
const App = express_1.default();
App.use(express_1.default.static(path_1.default.join(__dirname, '../static')));
App.use(express_1.default.json());
App.use(express_1.default.urlencoded({ extended: false }));
App.set('views', path_1.default.join(__dirname, '../views')); // html 동적 파일 위치
App.set('view engine', 'ejs');
App.engine('html', ejs_1.default.renderFile);
//Setting Express API Router
const user_1 = __importDefault(require("./routers/api/user"));
const record_1 = __importDefault(require("./routers/api/record"));
App.use('/api/user', user_1.default);
App.use('/api/record', record_1.default);
App.get("/", (req, res) => {
    res.send("<h1>Fermata API Server</h1><br><p>DEVELOPED BY LISBON</p>");
});
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
function main(input) {
    const method = input.method;
    const remoteAddress = "1.1.1.1";
    const headers = input.__ow_headers;
    delete input.__ow_headers;
    if (Database == null) {
        exports.Database = Database = mysql_1.default.createConnection(input.db);
        Database.connect();
    }
    return new Promise((s, j) => {
        var req;
        if (input.path)
            input.path = input.path.replace("\\", "");
        if (input.path == "user") {
            req = new request_1.default({
                method: method,
                headers: headers,
                body: input,
                remoteAddress: remoteAddress,
                url: "/",
            });
            user_1.default(req, new response_1.default((result) => {
                s(result);
            }), () => { });
        }
        else if (input.path == "record") {
            req = new request_1.default({
                method: method,
                headers: headers,
                body: input,
                remoteAddress: remoteAddress,
                url: "/",
            });
            record_1.default(req, new response_1.default((result) => {
                s(result);
            }), () => { });
        }
        else if (input.path == "records/infection") {
            req = new request_1.default({
                method: method,
                headers: headers,
                body: input,
                remoteAddress: remoteAddress,
                url: "/infection",
            });
            record_1.default(req, new response_1.default((result) => {
                s(result);
            }), () => { });
        }
        else {
            s({});
        }
    });
}
exports.main = main;
//# sourceMappingURL=index.js.map