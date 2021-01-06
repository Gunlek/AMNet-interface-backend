const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Delete a hardware request created by user
 * Only possible for administrators
*/
const AdminMaterialDeleteRequest = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    if(!req.session['logged_in']){
        req.session.returnTo = '/admin/material/';
        res.redirect('/users/login/');
    }
    else {
        if(req.session['user_rank'] != "admin")
        {
            res.redirect('/');
        }
        else {
            let material_id = parseInt(req.params.material_id);
            database.query('DELETE FROM materials WHERE material_id = ?', [material_id], () => {
                res.redirect('/admin/material/');
            });
        }
    }
}

module.exports = { AdminMaterialDeleteRequest };
