const { DatabaseSingleton } = require('../utils/databaseSingleton');

/*
 * Display user's profile edition page
*/
const UserProfile = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    if(!req.session['logged_in']){
        req.session.returnTo = '/user/profile/';
        res.redirect('/users/login/');
    }
    else {
        database.query('SELECT * FROM users WHERE user_id = ?', [req.session['user_id']], (_, results, __) => {
            database.query('SELECT * FROM settings', (error, settings_results, fields) => {
                let settings = {};
                settings_results.forEach(param => {
                    settings[param['setting_name']] = param['setting_value'].replace(/<br\/>/g, '\n');
                });
                if(results.length > 0){
                    res.render('users/profile.html.twig', {user_data: results[0], setting: settings, phone_err: req.query['phone_err'] == "1" ? true : false});
                }
            });
        });
    }
}

module.exports = { UserProfile };