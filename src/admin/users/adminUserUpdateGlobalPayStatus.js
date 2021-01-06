const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Update cotisation status for all the users
*/
const AdminUserUpdateGlobalPayStatus = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    let {status} = req.params;
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
            database.query('UPDATE users SET user_pay_status=?', [status], () => {
                res.redirect('/admin/users');
            });
        }
    }
}

module.exports = { AdminUserUpdateGlobalPayStatus };
