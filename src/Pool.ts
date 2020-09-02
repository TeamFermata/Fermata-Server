import path from "path"
import Mysql from "mysql2"

export function getPool(){
    const DBconfig:Mysql.PoolOptions = {
        host:process.env.DB_HOST,
        port:parseInt(process.env.DB_PORT!),
        user:process.env.DB_USER,
        password:process.env.DB_PASSWORD,
        database:process.env.DB_NAME,
        multipleStatements:true
    }

    const Pool = Mysql.createPool(DBconfig)

    return {
        getConnection: (Callback:(err:NodeJS.ErrnoException, Database:Mysql.PoolConnection) => void) => {
            Pool.getConnection(Callback)
        },
        end:(Callback: (err:Mysql.QueryError) => void) => {
            Pool.end(Callback)
        }
    }

}

export enum WorkCode{
    SUCCESS,

    SQL_UNKNOWN,
    SQL_EQUALS,
    SQL_NO_MATCH
}
