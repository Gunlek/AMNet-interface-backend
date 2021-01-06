const { DatabaseSingleton } = require('../utils/databaseSingleton');
const md5 = require('md5');

/*
 * Handle POST request from log-in page
 * Check if they are registered in the database and if username/password corresponds
*/
const UserProcessLogin = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    database.query('SELECT * FROM users WHERE user_name=? AND user_password=?', [req.body.username, md5(req.body.password)], (error, results, fields) => {
        if(results.length > 0)
        {
            req.session['logged_in'] = true;
            req.session['user_id'] = parseInt(results[0]['user_id']);
            req.session['user_name'] = req.body.username;
            req.session['user_rank'] = results[0]['user_rank'];
            req.session['user_pay_status'] = results[0]['user_pay_status'];
            let returnURL = "/";
            if(req.session.returnTo != null)
                returnURL = req.session.returnTo;
            res.redirect(returnURL);
        }
        else
            res.redirect('/users/login/?state=failed');
    });
}

module.exports = { UserProcessLogin };
