const { DatabaseSingleton } = require("../utils/databaseSingleton");

/*
 * Handle POST request from reset-password page
 * Reset the password in SQL, gathering corresponding user (linked via token) and
 * update its account password
*/
const UserUpdatePassword = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    let password = md5(req.body.password);
    let conf_password = md5(req.body.conf_password);
    let token = req.body.token;
    if(password === conf_password){
        database.query("SELECT token_user FROM reset_token WHERE token_value=?", [token], (errors, results, fields) => {
            if(results.length > 0){
                database.query("UPDATE users SET user_password = ? WHERE user_id = ?", [password, results[0]["token_user"]], () => {
                    database.query("DELETE FROM reset_token WHERE token_value = ?", [token], () => {
                        res.redirect('/users/login');
                    });
                });
            }
        });
    }
    else{
        res.redirect('/users/change_password/'+token+'?state=failed');
    }
}

module.exports = { UserUpdatePassword };
