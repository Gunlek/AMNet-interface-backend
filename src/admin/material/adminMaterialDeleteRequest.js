const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Delete a hardware request created by user
 * Only possible for administrators
*/
const AdminMaterialDeleteRequest = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();

    let material_id = parseInt(req.params.material_id);
    database.query('DELETE FROM materials WHERE material_id = ?', [material_id], () => {
        res.redirect('/admin/material/');
    });
}

module.exports = { AdminMaterialDeleteRequest };
