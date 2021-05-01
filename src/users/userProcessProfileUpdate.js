const { DatabaseSingleton } = require("../utils/databaseSingleton");
const { UpdateRadiusAccountPassword } = require("../utils/radius/updateRadiusAccountPassword");
const md5 = require('md5');
const { isPasswordValid } = require("../utils/isPasswordValid");

/*
 * Handle POST request to update user's profile based
 * on data from profile edition page
*/
const UserProcessProfileUpdate = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    const user_id = req.session['user_id'];
    
    const select_or_text = req.body.select_or_text;
    const user_name = req.body.user_name;
    const user_bucque = req.body.user_bucque;
    const user_firstname = req.body.user_firstname;
    const user_lastname = req.body.user_lastname;
    const user_fams = req.body.user_fams;
    const user_campus = req.body.user_campus;
    const user_email = req.body.user_email;
    const user_phone = req.body.user_phone;
    
    let user_proms = req.body.user_proms_select;
    if(select_or_text === "text"){
        user_proms = req.body.user_proms_text;
    }

    let user_password = req.body.user_password;
    let user_confPassword = req.body.user_confPassword;

    if(user_password != "" && user_confPassword != ""){
        let clearPassword = req.body.user_password;
        if(isPasswordValid(clearPassword)){
            user_password = md5(user_password);
            user_confPassword = md5(user_confPassword);
            if(user_password===user_confPassword){
                database.query('UPDATE users SET user_bucque=?, user_firstname=?, user_lastname=?, user_fams=?, user_campus=?, user_proms=?, user_email=?, user_phone=?, user_password=? WHERE user_id = ?', [user_bucque, user_firstname, user_lastname, user_fams, user_campus, user_proms, user_email, user_phone, user_password, user_id], (err, results, fields) => {
                    if(err) throw err;
                    UpdateRadiusAccountPassword(user_name, clearPassword);
                    res.redirect('/users/profile/');
                });
            }
            else {
                res.redirect('/users/profile/?err=1')
            }
        }
        else {
            res.redirect('/users/profile/?err=2')
        }
    }
    else {
        database.query('UPDATE users SET user_bucque=?, user_firstname=?, user_lastname=?, user_fams=?, user_campus=?, user_proms=?, user_email=?, user_phone=? WHERE user_id = ?', [user_bucque, user_firstname, user_lastname, user_fams, user_campus, user_proms, user_email, user_phone, user_id], (err, results, fields) => {
            if(err) throw err;
            res.redirect('/users/profile/');
        });
    }
}

module.exports = { UserProcessProfileUpdate };