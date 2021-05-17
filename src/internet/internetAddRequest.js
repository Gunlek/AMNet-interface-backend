const { DatabaseSingleton } = require("../utils/databaseSingleton");
const { prepareMacAddress } = require("../utils/prepareMacAddress");

/*
 * Handle request adding, gathering data from access-request form
*/
const InternetAddRequest = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    
    let { userId, macAddr, description } = req.body;
    if(!!req.file){
        const accessProof = req.file.filename;
        macAddr = prepareMacAddress(macAddr);

        database.query('SELECT * FROM access WHERE access_mac = ?', [macAddr], (errors, results, fields) => {
            if(!!results && results.length > 0){
                res.redirect('/internet/?error=2');
            }
            else {
                database.query('INSERT INTO access(access_description, access_mac, access_user, access_proof) VALUES(?, ?, ?, ?)', [description, macAddr, userId, accessProof], () => {
                    res.redirect('/internet/');
                });
            }
        })
    }
    else {
        res.redirect('/internet/?error=1');
    }
}

module.exports = { InternetAddRequest };
