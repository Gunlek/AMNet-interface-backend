const { DatabaseSingleton } = require('../utils/databaseSingleton');
const md5 = require('md5');


const loginUser = (req, username, password) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    const loggedIn = new Promise((resolve) => {
        database.query('SELECT * FROM users WHERE user_name=? AND user_password=?', [username, md5(password)], (error, results, fields) => {
            if(results.length > 0)
            {
                req.session['logged_in'] = true;
                req.session['user_id'] = parseInt(results[0]['user_id']);
                req.session['user_name'] = req.body.username;
                req.session['user_rank'] = results[0]['user_rank'];
                req.session['user_pay_status'] = results[0]['user_pay_status'];

                resolve(true);
            }
            else {
                resolve(false);
            }
        })
    });

    return loggedIn;
}

module.exports = { loginUser };