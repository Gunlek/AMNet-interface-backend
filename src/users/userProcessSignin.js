const { DatabaseSingleton } = require("../utils/databaseSingleton");
const md5 = require('md5');
const { RegisterNewRadiusUser } = require("../utils/radius/registerNewRadiusUser");
const { isPasswordValid } = require("../utils/isPasswordValid");
const { loginUser } = require('../utils/loginUser');

require('dotenv').config();

/*
 * Handle POST request from sign-in page
 * Gather username, firstname, lastname, email, bucque, fams, proms and password from
 * form and check if password and conf_password corresponds
 * then register the newly created user to the database and redirect to log-in
*/
const UserProcessSignin = async (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    const { username, firstname, lastname, email, phone, bucque, fams } = req.body;
    let clearPassword = req.body.password;          // Used by radius
    let password = md5(clearPassword);
    let password_conf = md5(req.body.password_confirmation);
    let charte = req.body.check_charte;

    const validateUsername = (username) => /^[a-zA-Z0-9 ]+$/.test(username);

    const select_or_text = req.body.select_or_text;
    let proms = req.body.user_proms_select;
    if(select_or_text === "text"){
        proms = req.body.user_proms_text;
    }

    if(isPasswordValid(clearPassword)){
        if((username !== "" && proms !== "" && email !== "" && phone !== "") && password === password_conf){
            if(charte=="true"){

                if(!validateUsername(username))
                    res.redirect('/users/signin/?state=invalid_username');
                else {
                    database.query('SELECT * FROM users WHERE user_name=?', [username], function(errors, results, fields){
                        if(results.length == 0){
                            database.query('SELECT * FROM users WHERE user_email=?', [email], async (errors, user_results, fields) => {
                                if(user_results.length == 0){
                                    database.query('INSERT INTO users(user_name, user_firstname, user_lastname, user_email, user_phone, user_password, user_bucque, user_fams, user_proms, user_campus) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [username, firstname, lastname, email, phone, password, bucque, fams, proms, tbk]);
                                    if(process.env.RADIUS == "true"){
                                        RegisterNewRadiusUser(username, firstname, lastname, email, clearPassword);
                                    }
                                    
                                    let loggedIn = await loginUser(req, req.body.username, req.body.password);
                                    if(loggedIn){
                                            let returnURL = "/";
                                            if(req.session.returnTo != null)
                                                returnURL = req.session.returnTo;
                                            res.redirect(returnURL);
                                    }
                                    else
                                        res.redirect('/users/login/?state=failed');
                                }
                                else {
                                    res.redirect('/users/signin/?state=email_already_used');
                                }
                            });
                        }
                        else
                            res.redirect('/users/signin/?state=username_already_used');
                    });
                }
            }
            else
                res.redirect('/users/signin/?state=no_charte');
        }
        else
            res.redirect('/users/signin/?state=empty_field');
    }
    else
        res.redirect('/users/signin/?state=invalid_password');
}

module.exports = { UserProcessSignin };
