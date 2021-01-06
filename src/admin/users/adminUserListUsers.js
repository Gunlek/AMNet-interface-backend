const { DatabaseSingleton } = require("../../utils/databaseSingleton");;

/*
    * Displays the list of all the users registered in the system
    * Displays all their attributes and the number of registered
    * MAC address per account
*/
const AdminUserListUsers = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    if(!req.session['logged_in']){
        req.session.returnTo = '/admin/users/';
        res.redirect('/users/login/');
    }
    else if(!req.session['user_rank'] == 'admin'){
        res.redirect('/');
    }
    else {
        database.query('SELECT *, COUNT(access_id) AS mac_count FROM `users` LEFT JOIN `access` ON users.user_id=access.access_user GROUP BY user_id', (errors, results, fields) => {
            res.render('admin/admin-users.html.twig', {data: req.session, user_list: results});
        });
    }
}

module.exports = { AdminUserListUsers };
