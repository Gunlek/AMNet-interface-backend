const { DatabaseSingleton } = require("../../utils/databaseSingleton");
const { DeleteRadiusUser } = require("../../utils/radius/deleteRadiusUser");

/*
 * Delete a user from users table based on its user_id (passed over GET)
*/
const AdminUserDeleteUser = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();

    const { user_id } = req.params;

    database.query('SELECT * FROM users WHERE user_id = ?', [user_id], (err, results, fields) => {
        if(results.length > 0){
            DeleteRadiusUser(results[0]['username']);
        }

        database.query('DELETE FROM users WHERE user_id = ?', [user_id], () => {
            res.redirect('/admin/users/');
        });
    })
}

module.exports = { AdminUserDeleteUser };
