const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Displays the specific profile page
 * Allows admin to check a specific profile from tables
*/
const AdminUserProfile = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    
    if(req.params.user_id != ""){
        database.query('SELECT * FROM users WHERE user_id = ?', [parseInt(req.params.user_id)], (errors, results, fields) => {
            if(results.length > 0)
                res.render('admin/admin-profile.html.twig', {data: req.session, user_data: results[0]})
        });
    }
}

module.exports = { AdminUserProfile };
