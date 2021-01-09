const { DatabaseSingleton } = require("../../utils/databaseSingleton");
const { EnableRadiusConnection } = require('../../utils/radius/enableRadiusConnection');
const { DisableRadiusConnection } = require('../../utils/radius/disableRadiusConnection');

/*
 * Update cotisation status for all the users
*/
const AdminUserUpdateGlobalPayStatus = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    let {status} = req.params;
    
    database.query('SELECT * FROM users', (err, results, fields) => {
        results.forEach((user) => {
            if(status == "1")
                EnableRadiusConnection(user['user_name']);
            else
                DisableRadiusConnection(user['user_name']);
        });
    });
    database.query('UPDATE users SET user_pay_status=?', [status], () => {
        res.redirect('/admin/users');
    });
}

module.exports = { AdminUserUpdateGlobalPayStatus };
