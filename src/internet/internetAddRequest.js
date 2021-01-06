const { DatabaseSingleton } = require("../utils/databaseSingleton");

/*
 * Handle request adding, gathering data from access-request form
*/
const InternetAddRequest = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    let mac_addr = req.body.mac_addr.replace(/-/g, ':');
    let description = req.body.description;
    let user_id = req.body.user_id;

    database.query('INSERT INTO access(access_description, access_mac, access_user) VALUES(?, ?, ?)', [description, mac_addr, user_id], () => {
        res.redirect('/internet/');
    });
}

module.exports = { InternetAddRequest };
