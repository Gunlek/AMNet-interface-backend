const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Allows an administrator to mark an internet request as "declined"
*/
const AdminInternetDisallowAccess = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();

    let access_id = parseInt(req.params.access_id);
    database.query('SELECT * FROM access WHERE access_id = ?', [access_id], (errors, results, fields) => {
        if(!!results && results.length > 0) {
            if(process.env.RADIUS == "true"){
                DisableRadiusIOTConnection(results[0].access_mac);
            }
            database.query('UPDATE access SET access_state = "suspended" WHERE access_id = ?', [access_id], () => {
                res.redirect('/admin/internet/');
            });
        }
    });
}

module.exports = { AdminInternetDisallowAccess };
