const { DatabaseSingleton } = require("../utils/databaseSingleton");

/*
 * Displays the list of all the requested hardware for the currently logged-in
 * user
*/
const MaterialHome = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    
    if(req.session['user_pay_status'] == 0)
        res.redirect('/users/profile/');
    else {
        database.query('SELECT * FROM materials WHERE material_user = ?', [1], function(error, results, fields){
            res.render('material/list-requests.html.twig', {data: req.session, requests_list: results});
        });
    }
}

module.exports = { MaterialHome };
