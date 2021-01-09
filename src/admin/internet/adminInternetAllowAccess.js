const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Allows an administrator to mark an internet request as "agreed"
*/
const AdminInternetAllowAccess = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    
    let access_id = parseInt(req.params.access_id);
    database.query('UPDATE access SET access_state = "active" WHERE access_id = ?', [access_id], () => {
        res.redirect('/admin/internet/');
    });
}

module.exports = { AdminInternetAllowAccess };
