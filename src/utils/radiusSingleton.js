let mysql = require('mysql');

require('dotenv').config();

/**
 * This is a Singleton class for Radius database
 */
const RadiusSingleton = (function(){

    const RadiusClass = function(){
        this.radiusDatabase = mysql.createConnection({
            host    :   process.env.RADIUS_DB_HOST,
            user    :   process.env.RADIUS_DB_USER,
            password:   process.env.RADIUS_DB_PASS,
            database:   process.env.RADIUS_DB_NAME
        });
        this.radiusDatabase.connect();

        this.getDatabase = () => {
            return this.radiusDatabase;
        }
    }
    let databaseInstance = null;

    return new function(){
        this.getInstance = () => {
            if(databaseInstance == null){
                databaseInstance = new RadiusClass();
            }

            return databaseInstance;
        }
    }
})();

module.exports = { RadiusSingleton }