const { DatabaseSingleton } = require("../../utils/databaseSingleton");

/*
 * Gather all the currently saved requests of hardware and display them
 * in tables to allow easier management from administrators
*/
const AdminMaterial = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    
    req.session.returnTo = '/admin/material/';
    database.query('SELECT * FROM materials WHERE material_state="granted"', (errors, granted_requests, fields) => {
        database.query('SELECT * FROM materials WHERE material_state="declined"', (errors, declined_requests, fields) => {
            database.query('SELECT * FROM materials WHERE material_state="pending"', (errors, pending_requests, fields) => {
                database.query('SELECT * FROM users', (errors, users, fields) => {
                    let user_list = {};
                    for(let k = 0; k < users.length; k++){
                        let user = users[k];
                        user_list[user['user_id']] = {user_id: user['user_id'], user_name: user['user_name'], user_bucque: user['user_bucque'], user_fams: user['user_fams'], user_proms: user['user_proms'], user_rank: user['user_rank']}
                        if(k == users.length - 1)
                            res.render('admin/admin-material.html.twig', {data: req.session, granted_requests: granted_requests, declined_requests: declined_requests, pending_requests: pending_requests, user_list: user_list});
                    }
                });
            });
        });
    });
}

module.exports = { AdminMaterial };
