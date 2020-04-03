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
const express_1 = __importDefault(require("express"));
const mysql_1 = __importDefault(require("mysql"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
//Initialize Settings
const Database = mysql_1.default.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    port: 3306,
    database: process.env.DB_NAME
});
exports.Database = Database;
Database.connect();
const App = express_1.default();
App.use(express_1.default.static(path_1.default.join(__dirname, '../static')));
App.use(express_1.default.json());
App.use(express_1.default.urlencoded({ extended: false }));
App.set('views', path_1.default.join(__dirname, '../views')); // html 동적 파일 위치
App.set('view engine', 'ejs');
App.engine('html', ejs_1.default.renderFile);
//Setting Express API Router
const introduce_1 = __importDefault(require("./routers/introduce"));
const user_1 = __importDefault(require("./routers/api/user"));
const record_1 = __importDefault(require("./routers/api/record"));
App.use('/introduce', introduce_1.default); //추후 삭제 예정
App.use('/api/user', user_1.default);
App.use('/api/record', record_1.default);
App.get("/", (req, res) => {
    res.send("<h1>Fermata API Server</h1><br><p>DEVELOPED BY LISBON</p>");
});
//Start Server
App.listen(process.env.PORT || 80); //HTTP
try {
    const SSLsetting = {
        key: fs_1.default.readFileSync(process.env.SSL_KEY),
        cert: fs_1.default.readFileSync(process.env.SSL_CERT)
    };
    https_1.default.createServer(SSLsetting, App).listen(443); //HTTPS
}
catch (ex) {
    console.log("HTTPS Server Create Failed");
}
//# sourceMappingURL=app.js.map