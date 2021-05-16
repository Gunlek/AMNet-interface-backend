const { DatabaseSingleton } = require("../../utils/databaseSingleton");
const { DisableRadiusIOTConnection } = require("../../utils/radius/disableRadiusIOTConnection");
const { prepareMacAddress } = require('./adminInternetAllowAccess');

/*
 * Delete a hardware request created by user
 * Only possible for administrators
*/
const AdminInternetDeleteAccess = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();

    let access_id = parseInt(req.params.access_id);
    database.query('SELECT * FROM access WHERE access_id = ?', [access_id], (errors, results, fields) => {
        if(!!results && results.length > 0) {
            if(process.env.RADIUS == "true"){
                DisableRadiusIOTConnection(prepareMacAddress(results[0].access_mac));
            }
            database.query('DELETE FROM access WHERE access_id = ?', [access_id], () => {
                res.redirect('/admin/internet/');
            });
        }
    });
}

module.exports = { AdminInternetDeleteAccess };
