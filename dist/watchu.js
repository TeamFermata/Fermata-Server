"use strict";
/*
    Fermata Server
    watchu 라이브러리(서버 모니터링 및 관리앱 통신 라이브러리)
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import modules
const socket_io_1 = __importDefault(require("socket.io"));
const qrcode = require("qrcode-terminal");
//define library
class watchu {
    constructor(hostIP, hostport = 5662, serverProcess, users) {
        this.hostIP = hostIP;
        this.hostport = hostport;
        this.serverProcess = serverProcess;
        this.users = users;
        this.Server = socket_io_1.default();
    }
    //OBJECT로부터 사용자 설정 가져오기
    static getUsersFromObj(obj) {
        var resultarr = [];
        obj.forEach((it) => {
            resultarr.push(new watchuUser(it.id, it.pw, it.permissions));
        });
        return resultarr;
    }
    //서버 시작
    start() {
        this.Server.listen(this.hostport);
        this.Server.on("connection", (socket) => {
            console.log("watchu : client connected.");
            let ID = socket.handshake.query.id != null ? socket.handshake.query.id : "";
            let PW = socket.handshake.query.pw != null ? socket.handshake.query.pw : "";
            const User = this.users.find(it => it.id == ID && it.pw == PW);
            if (User != undefined) { //계정이 맞다면
                socket.emit("ServerInformation", {
                    "AppTitle": this.serverProcess.title,
                    "Nodeversion": this.serverProcess.version,
                    "PID": this.serverProcess.pid,
                    "Platform": this.serverProcess.platform
                });
                this.serverProcess.on("uncaughtException", (err) => {
                    socket.emit("Exception", { "error": err });
                });
                this.serverProcess.on("exit", (code) => {
                    socket.emit("SERVER_STOP"); //서버 종료된 것 알림
                });
                socket.on("Usage", () => {
                    socket.emit("Usage", { "CPU": this.serverProcess.cpuUsage(), "Memory": this.serverProcess.memoryUsage() });
                });
                socket.on("Close", () => {
                    if (this.hasPermission(User, watchuPermission.PERMISSION_ADMIN)) {
                        process.exit(0);
                    }
                    else {
                        socket.emit("ERR_NOT_PERMISSION");
                    }
                });
            }
            else {
                socket.emit("ERR_CON");
            }
        });
        qrcode.generate(`${this.hostIP}:${this.hostport}`);
        console.log(`${this.hostIP}:${this.hostport}에서 호스팅 시작.\n호스트 도메인 또는 ID가 미설정되었을 경우 직접 앱에 입력하세요!`);
    }
    //권한여부 확인
    hasPermission(user, requirePermission) {
        user.permissions.forEach((it) => {
            if (it == requirePermission) {
                return true;
            }
        });
        return false;
    }
}
exports.watchu = watchu;
//사용자 object
class watchuUser {
    constructor(id, pw, permissions) {
        this.id = id;
        this.pw = pw;
        this.permissions = permissions;
    }
}
exports.watchuUser = watchuUser;
//사용자 권한
var watchuPermission;
(function (watchuPermission) {
    watchuPermission[watchuPermission["PERMISSION_ADMIN"] = 0] = "PERMISSION_ADMIN";
    watchuPermission[watchuPermission["PERMISSION_VIEWONLY"] = 1] = "PERMISSION_VIEWONLY"; //상태 확인만 가능(기본값)
})(watchuPermission || (watchuPermission = {}));
exports.watchuPermission = watchuPermission;
//# sourceMappingURL=watchu.js.map