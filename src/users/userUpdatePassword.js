const md5 = require('md5');
const { DatabaseSingleton } = require("../utils/databaseSingleton");
const { isPasswordValid } = require('../utils/isPasswordValid');
const { UpdateRadiusAccountPassword } = require('../utils/radius/updateRadiusAccountPassword');

/*
 * Handle POST request from reset-password page
 * Reset the password in SQL, gathering corresponding user (linked via token) and
 * update its account password
*/
const UserUpdatePassword = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    let clearPassword = req.body.password;          // Used by radius
    let password = md5(clearPassword);
    let conf_password = md5(req.body.conf_password);
    let token = req.body.token;
    if(isPasswordValid(clearPassword)){
        if(password === conf_password){
            database.query("SELECT token_user FROM reset_token WHERE token_value=?", [token], (errors, results, fields) => {
                if(results.length > 0){
                    database.query("UPDATE users SET user_password = ? WHERE user_id = ?", [password, results[0]["token_user"]], () => {
                        database.query("DELETE FROM reset_token WHERE token_value = ?", [token], () => {
                            database.query('SELECT * FROM users WHERE user_id=?', [results[0]["token_user"]], (errors, user_results, fields) => {
                                if(user_results.length > 0)
                                    UpdateRadiusAccountPassword(user_results[0]['user_name'], clearPassword);
                                res.redirect('/users/login');
                            });
                        });
                    });
                }
            });
        }
        else{
            res.redirect('/users/change_password/'+token+'?state=failed');
        }
    }
    else
        res.redirect('/users/change_password/'+token+'?state=invalid_password');
}

module.exports = { UserUpdatePassword };
