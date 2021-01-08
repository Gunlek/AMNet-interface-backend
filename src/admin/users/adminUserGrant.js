const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/* 
 * Allow granting operation on users
 * To make them admin or downgrade them back to user
 * data (user_id and new user_rank) are passed over GET request
*/
const AdminUserGrant = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    let user_rank = req.params.user_rank;
    let user_id = req.params.user_id;
    
    database.query('UPDATE users SET user_rank = ? WHERE user_id = ?', [user_rank, user_id], () => {
        res.redirect('/admin/users/');
    });
}

module.exports = { AdminUserGrant };
