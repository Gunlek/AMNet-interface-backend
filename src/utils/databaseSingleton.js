let mysql = require('mysql');

require('dotenv').config();

const DatabaseSingleton = (function(){

    const DatabaseClass = function(){
        this.database = mysql.createConnection({
            host    :   process.env.DB_HOST,
            user    :   process.env.DB_USER,
            password:   process.env.DB_PASS,
            database:   process.env.DB_NAME
        });
        this.database.connect();

        this.getDatabase = () => {
            return this.database;
        }
    }
    let databaseInstance = null;

    return new function(){
        this.getInstance = () => {
            if(databaseInstance == null){
                databaseInstance = new DatabaseClass();
            }

            return databaseInstance;
        }
    }
})();

module.exports = { DatabaseSingleton }