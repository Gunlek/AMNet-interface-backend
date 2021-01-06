const { DatabaseSingleton } = require("../utils/databaseSingleton");

/*
 * Displays the index page of administration
*/
const AdminHome = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();

    if(!req.session['logged_in']){
        req.session.returnTo = '/admin/';
        res.redirect('/users/login/');
    }
    else if(!req.session['user_rank'] == 'admin'){
        res.redirect('/');
    }
    else {
        database.query('SELECT COUNT(*) as nb_user FROM users', (error, nb_users_result, fields) => {
            let nb_users = nb_users_result[0]['nb_user'];
            database.query('SELECT COUNT(*) as nb_cotiz FROM users WHERE user_pay_status=0', (error, nb_cotiz_results, fields) => {
                let nb_cotiz = nb_cotiz_results[0]['nb_cotiz'];
                database.query('SELECT COUNT(*) as nb_access_request FROM access WHERE access_state="pending"', (error, nb_access_request_results, fields) => {
                    let nb_access_request = nb_access_request_results[0]['nb_access_request'];
                    database.query('SELECT COUNT(*) as nb_material_request FROM materials WHERE material_state="pending"', (error, nb_material_request_result, fields) => {
                        let nb_material_request = nb_material_request_result[0]['nb_material_request'];
                        database.query('SELECT COUNT(*) as nb_tickets FROM tickets WHERE ticket_state=1', (error, nb_tickets_results, fields) => {
                            let nb_tickets = nb_tickets_results[0]['nb_tickets'];
                            database.query('SELECT * FROM settings', (error, settings_results, fields) => {
                                let settings = {};
                                settings_results.forEach(param => {
                                    settings[param['setting_name']] = param['setting_value'].replace(/<br\/>/g, '\n');
                                });
                                res.render('admin/admin-index.html.twig', {data: req.session, setting: settings, nb_users: nb_users, nb_cotiz: nb_cotiz, nb_access_request: nb_access_request, nb_material_request: nb_material_request, nb_tickets: nb_tickets});
                            });
                        });
                    });
                });
            });
        });
    }
}

module.exports = { AdminHome }