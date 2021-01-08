const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Delete a hardware request created by user
 * Only possible for administrators
*/
const AdminInternetDeleteAccess = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();

    let access_id = parseInt(req.params.access_id);
    database.query('DELETE FROM access WHERE access_id = ?', [access_id], () => {
        res.redirect('/admin/internet/');
    });
}

module.exports = { AdminInternetDeleteAccess };
