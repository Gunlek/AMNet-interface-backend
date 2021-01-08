const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Delete a user from users table based on its user_id (passed over GET)
*/
const AdminUserDeleteUser = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    
    database.query('DELETE FROM users WHERE user_id = ?', [req.params.user_id], () => {
        res.redirect('/admin/users/');
    });
}

module.exports = { AdminUserDeleteUser };
