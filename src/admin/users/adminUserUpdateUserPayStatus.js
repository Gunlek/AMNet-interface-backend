const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Update cotisation status for the specified user
*/
const AdminUserUpdateUserPayStatus = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    let {user_id, status} = req.params;
    if(!req.session['logged_in']){
        req.session.returnTo = '/admin/users';
        res.redirect('/users/login');
    }
    else {
        if(req.session['user_rank'] != "admin")
        {
            res.redirect('/');
        }
        else {
            database.query('UPDATE users SET user_pay_status=? WHERE user_id = ?', [status, user_id], () => {
                res.redirect('/admin/users');
            });
        }
    }
}

module.exports = { AdminUserUpdateUserPayStatus };
