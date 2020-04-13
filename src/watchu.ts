/*
    Fermata Server
    watchu 라이브러리(서버 모니터링 및 관리앱 통신 라이브러리)
*/

//import modules
import socketio from "socket.io"
import http from "http"
const qrcode = require("qrcode-terminal")

//define library
class watchu{

    //OBJECT로부터 사용자 설정 가져오기
    static getUsersFromObj(obj:Array<any>):Array<watchuUser>{
        var resultarr:Array<watchuUser> = []
        obj.forEach((it:any) => {
            resultarr.push(new watchuUser(it.id, it.pw, it.permissions))
        })
        return resultarr
    }

    constructor(private hostIP:string, private hostport:number = 5662, private serverProcess:NodeJS.Process, private users:Array<watchuUser>){
        this.Server = socketio()
    }
    Server:socketio.Server //socketio server

    //서버 시작
    start(){
        this.Server.listen(this.hostport)
        this.Server.on("connection", (socket) => { //핸들링  설정
            console.log("watchu : client connected.")
            let ID = socket.handshake.query.id != null ? socket.handshake.query.id : ""
            let PW = socket.handshake.query.pw != null ? socket.handshake.query.pw : ""
            const User = this.users.find(it => it.id == ID && it.pw == PW)
            if(User != undefined){ //계정이 맞다면
                socket.emit("ServerInformation", {
                    "AppTitle":this.serverProcess.title,
                    "Nodeversion":this.serverProcess.version,
                    "PID":this.serverProcess.pid,
                    "Platform":this.serverProcess.platform
                })

                this.serverProcess.on("uncaughtException", (err) => { //서버에 미처리 오류 발생 시
                    socket.emit("Exception", {"error" : err})
                })

                this.serverProcess.on("exit", (code) => {
                    socket.emit("SERVER_STOP") //서버 종료된 것 알림
                })

                socket.on("Usage", () => { //모든 권한에게 허용된 사용량 뷰 요청 시
                    socket.emit("Usage", {"CPU":this.serverProcess.cpuUsage(), "Memory":this.serverProcess.memoryUsage()})
                })
    
                socket.on("Close", () => { //서버 종료 명령이 들어올 때
                    if(this.hasPermission(User, watchuPermission.PERMISSION_ADMIN)){
                        process.exit(0)
                    }else{socket.emit("ERR_NOT_PERMISSION")}
                })
            }else{socket.emit("ERR_CON")}
        })

        qrcode.generate(`${this.hostIP}:${this.hostport}`)
        console.log(`${this.hostIP}:${this.hostport}에서 호스팅 시작.\n호스트 도메인 또는 ID가 미설정되었을 경우 직접 앱에 입력하세요!`)
    }

    //권한여부 확인
    private hasPermission(user:watchuUser, requirePermission:watchuPermission):boolean{
        user.permissions.forEach((it) => {
            if(it == requirePermission){return true}
        })
        return false
    }
}

//사용자 object
class watchuUser{
    id:string
    pw:string
    permissions:Array<watchuPermission>
    constructor(id:string, pw:string, permissions:Array<watchuPermission>){
        this.id = id
        this.pw = pw
        this.permissions = permissions
    }
}

//사용자 권한
enum watchuPermission{
    PERMISSION_ADMIN, //총 관리자
    PERMISSION_VIEWONLY //상태 확인만 가능(기본값)
}

export {watchu, watchuUser, watchuPermission}