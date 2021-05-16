const { DatabaseSingleton } = require("../../utils/databaseSingleton");
const { EnableRadiusIOTConnection } = require("../../utils/radius/enableRadiusIOTConnection");

const prepareMacAddress = (macAddress) => {
    return macAddress.replace('/-/g', '').replace('/:/g','').toUpperCase().replace('/ /g', '');
}

/*
 * Allows an administrator to mark an internet request as "agreed"
*/
const AdminInternetAllowAccess = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    
    let access_id = parseInt(req.params.access_id);
    database.query('SELECT * FROM access WHERE access_id = ?', [access_id], (errors, results, fields) => {
        if(!!results && results.length > 0) {
            if(process.env.RADIUS == "true"){
                EnableRadiusIOTConnection(prepareMacAddress(results[0].access_mac));
            }
            database.query('UPDATE access SET access_state = "active" WHERE access_id = ?', [access_id], () => {
                res.redirect('/admin/internet/');
            });
        }
    });
}

module.exports = { AdminInternetAllowAccess, prepareMacAddress };
