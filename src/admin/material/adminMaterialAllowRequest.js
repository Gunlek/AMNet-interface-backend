const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Allows an administrator to mark a hardware request as "agreed"
*/
const AdminMaterialAllowRequest = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    
    let material_id = parseInt(req.params.material_id);
    database.query('UPDATE materials SET material_state = "granted" WHERE material_id = ?', [material_id], () => {
        res.redirect('/admin/material/');
    });
}

module.exports = { AdminMaterialAllowRequest };
