const { DatabaseSingleton } = require("./databaseSingleton");
require('dotenv').config();

/**
 * Middleware to ensure that the user that does the request is logged in
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const isUserLoggedIn = (req, res, next) => {
    if(!req.session['logged_in']){
        if(req.session.stayConnected == 1){
            if(Date.now() - req.session.loggedInAt >= process.env.SESSION_DURATION){
                req.session.user_name = null;
                req.session.password = null;
                req.stayConnected = 0;
                req.loggedInAt = null;
                res.redirect('/users/login/');
            }
            else {
                let database = DatabaseSingleton.getInstance().getDatabase();
                database.query('SELECT * FROM users WHERE user_name=? AND user_password=?', [req.session.username, req.session.password], (error, result) => {
                    if(result.length > 0){
                        next();
                    }
                });
            }
        }
        else {
            req.session.returnTo = req.url;
            res.redirect('/users/login/');
        }
    }
    else {
        next();
    }
}

module.exports = { isUserLoggedIn };