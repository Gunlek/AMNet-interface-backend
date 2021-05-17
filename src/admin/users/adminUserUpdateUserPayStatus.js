const { DatabaseSingleton } = require("../../utils/databaseSingleton");
const { EnableRadiusConnection } = require("../../utils/radius/enableRadiusConnection");
const { DisableRadiusConnection } = require('../../utils/radius/disableRadiusConnection');
const { EnableRadiusIOTConnection } = require('../../utils/radius/enableRadiusIOTConnection');
const { DisableRadiusIOTConnection } = require('../../utils/radius/disableRadiusIOTConnection');

/*
 * Update cotisation status for the specified user
*/
const AdminUserUpdateUserPayStatus = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    let {user_id, status} = req.params;
    
    database.query('SELECT * FROM users WHERE user_id = ?', [user_id], (err, results, fields) => {
        if(results.length > 0){
            if(process.env.RADIUS == "true"){
                database.query('SELECT * FROM access WHERE access_user = ? AND access_state = "active"', [user_id], (errors, access, fields) => {
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
                    EnableRadiusConnection(results[0]['user_name']);
                else
                    DisableRadiusConnection(results[0]['user_name']);
            }
        }
    });

    database.query('UPDATE users SET user_pay_status=? WHERE user_id = ?', [status, user_id], () => {
        res.redirect('/admin/users');
    });
}

module.exports = { AdminUserUpdateUserPayStatus };
