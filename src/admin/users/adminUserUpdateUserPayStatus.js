const { DatabaseSingleton } = require("../../utils/databaseSingleton");
const { EnableRadiusConnection } = require("../../utils/radius/enableRadiusConnection");
const { DisableRadiusConnection } = require('../../utils/radius/disableRadiusConnection');

/*
 * Update cotisation status for the specified user
*/
const AdminUserUpdateUserPayStatus = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    let {user_id, status} = req.params;
    
    database.query('SELECT * FROM users WHERE user_id = ?', [user_id], (err, results, fields) => {
        if(results.length > 0){
            if(status == "1")
                EnableRadiusConnection(results[0]['user_name']);
            else
                DisableRadiusConnection(results[0]['user_name']);
        }
    });

    database.query('UPDATE users SET user_pay_status=? WHERE user_id = ?', [status, user_id], () => {
        res.redirect('/admin/users');
    });
}

module.exports = { AdminUserUpdateUserPayStatus };
