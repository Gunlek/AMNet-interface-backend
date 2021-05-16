const { DatabaseSingleton } = require("../utils/databaseSingleton");

/*
 * Handle request adding, gathering data from access-request form
*/
const InternetAddRequest = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    
    let { userId, macAddr, description } = req.body;
    if(!!req.file){
        const accessProof = req.file.filename;
        macAddr = macAddr.replace(/-/g, ':');

        database.query('INSERT INTO access(access_description, access_mac, access_user, access_proof) VALUES(?, ?, ?, ?)', [description, macAddr, userId, accessProof], () => {
            res.redirect('/internet/');
        });
    }
    else {
        res.redirect('/internet/?error=1');
    }
}

module.exports = { InternetAddRequest };
