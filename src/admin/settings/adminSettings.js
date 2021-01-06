const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Allow an administrator to update settings and generate tokens
*/
const AdminSettings = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    if(!req.session['logged_in']){
        req.session.returnTo = '/admin/settings/';
        res.redirect('/users/login/');
    }
    else {
        if(req.session['user_rank'] != "admin")
        {
            res.redirect('/');
        }
        else {
            database.query('SELECT * FROM settings', (errors, results, fields) => {
                let json_dataset = {};
                for(let dataset of results){
                    json_dataset[dataset['setting_name']] = dataset['setting_value'];
                }
                res.render('admin/admin-settings.html.twig', {data: req.session, form_data: json_dataset});
            });
        }
    }
}

module.exports = { AdminSettings };
