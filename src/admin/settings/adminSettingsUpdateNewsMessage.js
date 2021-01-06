const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Update news message from admin-index form
*/
const AdminSettingsUpdateNewsMessage = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();

    if(!req.session['logged_in']){
        req.session.returnTo = '/admin/';
        res.redirect('/users/login/');
    }
    else {
        if(req.session['user_rank'] != "admin")
        {
            res.redirect('/');
        }
        else {
            let new_message = req.body.news_message.replace(/\r\n|\r|\n/g, '<br/>');
            database.query('UPDATE settings SET setting_value=? WHERE setting_name="news_message"', [new_message], () => {
                res.redirect('/admin/');
            });
        }
    }
}

module.exports = { AdminSettingsUpdateNewsMessage };
