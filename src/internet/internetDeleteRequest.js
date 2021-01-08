const { DatabaseSingleton } = require('../utils/databaseSingleton');

/*
 * Delete a request created by user
*/
const InternetDeleteRequest = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    
    database.query('SELECT * FROM access WHERE access_id = ? AND access_user = ?', [req.params.access_id, req.params.user_id], function(errors, results, fields){
        if(results.length > 0){
            database.query('DELETE FROM access WHERE access_id = ?', [req.params.access_id]);
            res.redirect('/internet/');
        }
        else {
            res.redirect('/users/login/');
        }
    });
}

module.exports = { InternetDeleteRequest };
