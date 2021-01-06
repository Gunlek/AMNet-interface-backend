const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Update settings based on data
 */
const AdminSettingsUpdateSettings = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    if(!req.session['logged_in']){
        req.session.returnTo = '/admin/';
        res.redirect('/users/login/');
    }
    else if(!req.session['user_rank'] == 'admin'){
        res.redirect('/');
    }
    else {
        const api_token = req.body.api_token;
        const lydia_token = req.body.lydia_token;
        const active_proms = req.body.active_proms;
        const lydia_cotiz = parseFloat(req.body.lydia_cotiz.toString().replace(",", "."));

        database.query('UPDATE settings SET setting_value=? WHERE setting_name="api_token"', [api_token], (err, results, fields) => {
            database.query('UPDATE settings SET setting_value=? WHERE setting_name="lydia_token"', [lydia_token], (err, results, fields) => {
                database.query('UPDATE settings SET setting_value=? WHERE setting_name="active_proms"', [active_proms], (err, results, fields) => {
                    database.query('UPDATE settings SET setting_value=? WHERE setting_name="lydia_cotiz"', [lydia_cotiz], (err, results, fields) => {
                        res.redirect('/admin/');
                    });
                });
            });
        });
    }
}

module.exports = { AdminSettingsUpdateSettings };
