const { DatabaseSingleton } = require('../utils/databaseSingleton');

/*
 * Displays the list of all the requested access for the currently logged-in
 * user
*/
const InternetHome = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    if(!req.session['logged_in']) {
        req.session.returnTo = '/internet/';
        res.redirect('/users/login/');
    }
    else {
        if(req.session['user_pay_status'] == 0)
            res.redirect('/user/profile/');
        else {
            database.query('SELECT * FROM access WHERE access_user = ?', [req.session.user_id], function(error, results, fields){
                res.render('internet/list-access.html.twig', {data: req.session, access_list: results});
            });
        }
    }
}

module.exports = { InternetHome };
