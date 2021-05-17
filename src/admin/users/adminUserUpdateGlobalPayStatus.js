const { DatabaseSingleton } = require("../../utils/databaseSingleton");
const { EnableRadiusConnection } = require('../../utils/radius/enableRadiusConnection');
const { DisableRadiusConnection } = require('../../utils/radius/disableRadiusConnection');
const { EnableRadiusIOTConnection } = require('../../utils/radius/enableRadiusIOTConnection');
const { DisableRadiusIOTConnection } = require('../../utils/radius/disableRadiusIOTConnection');

/*
 * Update cotisation status for all the users
*/
const AdminUserUpdateGlobalPayStatus = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    let {status} = req.params;
    
    database.query('SELECT * FROM users', (err, results, fields) => {
        results.forEach((user) => {
            if(process.env.RADIUS == "true"){
                database.query('SELECT * FROM access WHERE access_user = ? AND access_state = "active"', [user.user_id], (errors, access, fields) => {
                    if(!!access){
                        access.map((currentAccess) => {
                            if(status == "1")
                                EnableRadiusIOTConnection(currentAccess.access_mac);
                            else
                                DisableRadiusIOTConnection(currentAccess.access_mac);
                        });
                    }
                });

                if(status == "1")
                    EnableRadiusConnection(user['user_name']);
                else
                    DisableRadiusConnection(user['user_name']);
            }
        });
    });
    database.query('UPDATE users SET user_pay_status=?', [status], () => {
        res.redirect('/admin/users');
    });
}

module.exports = { AdminUserUpdateGlobalPayStatus };
