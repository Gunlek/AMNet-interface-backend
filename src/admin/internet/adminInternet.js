const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Displays all the currently saved requests and display them
 * in tables to allow easier management from administrators
*/
const AdminInternet = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    req.session.returnTo = '/admin/internet/';
    database.query('SELECT * FROM access WHERE access_state="pending"', (errors, pending_access, fields) => {
        database.query('SELECT * FROM access WHERE access_state="active"', (errors, active_access, fields) => {
            database.query('SELECT * FROM access WHERE access_state="suspended"', (errors, suspended_access, fields) => {
                database.query('SELECT * FROM users', (errors, users, fields) => {
                    let user_list = {};
                    for(let k = 0; k < users.length; k++){
                        let user = users[k];
                        user_list[user['user_id']] = {user_id: user['user_id'], user_name: user['user_name'], user_bucque: user['user_bucque'], user_fams: user['user_fams'], user_proms: user['user_proms'], user_rank: user['user_rank']}
                        if(k == users.length - 1)
                            res.render('admin/admin-internet.html.twig', {
                                data: req.session, 
                                pending_requests: pending_access, 
                                active_requests: active_access, 
                                suspended_requests: suspended_access, 
                                user_list: user_list
                            });
                    }
                });
            });
        });
    });
}

module.exports = { AdminInternet };
