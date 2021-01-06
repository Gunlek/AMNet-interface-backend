const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Delete a user from users table based on its user_id (passed over GET)
*/
const AdminUserDeleteUser = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    if(!req.session['logged_in']){
        req.session.returnTo = '/admin/users/';
        res.redirect('/users/login/');
    }
    else {
        if(req.session['user_rank'] != "admin")
        {
            res.redirect('/');
        }
        else {
            database.query('DELETE FROM users WHERE user_id = ?', [req.params.user_id], () => {
                res.redirect('/admin/users/');
            });
        }
    }
}

module.exports = { AdminUserDeleteUser };
