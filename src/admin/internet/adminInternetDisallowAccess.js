const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Allows an administrator to mark an internet request as "declined"
*/
const AdminInternetDisallowAccess = (req, res) => {
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
            database.query('UPDATE access SET access_state = "suspended" WHERE access_id = ?', [access_id], () => {
                res.redirect('/admin/internet/');
            });
        }
    }
}

module.exports = { AdminInternetDisallowAccess };
