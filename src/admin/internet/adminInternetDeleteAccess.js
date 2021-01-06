const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Delete a hardware request created by user
 * Only possible for administrators
*/
const AdminInternetDeleteAccess = (req, res) => {
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
            let access_id = parseInt(req.params.access_id);
            database.query('DELETE FROM access WHERE access_id = ?', [access_id], () => {
                res.redirect('/admin/internet/');
            });
        }
    }
}

module.exports = { AdminInternetDeleteAccess };
