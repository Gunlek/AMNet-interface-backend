let mysql = require('mysql');
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false});
let session = require('express-session');
require('dotenv').config();

let connection = mysql.createConnection({
    host    :   process.env.DB_HOST,
    user    :   process.env.DB_USER,
    password:   process.env.DB_PASS,
    database:   process.env.DB_NAME
});

connection.connect();

// In all renderers, data corresponds to the data saved in the current session

module.exports = (app) => {

    app.use(session({
        secret: "amnet-interface",
        resave: false,
        saveUninitialized: false,
    }));

    /*
     * Displays the index page of administration
     */
    app.get('/admin/', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/admin/';
            res.redirect('/users/login/');
        }
        else if(!req.session['user_rank'] == 'admin'){
            res.redirect('/');
        }
        else {
            connection.query('SELECT COUNT(*) as nb_user FROM users', (error, nb_users_result, fields) => {
                let nb_users = nb_users_result[0]['nb_user'];
                connection.query('SELECT COUNT(*) as nb_cotiz FROM users WHERE user_pay_status=0', (error, nb_cotiz_results, fields) => {
                    let nb_cotiz = nb_cotiz_results[0]['nb_cotiz'];
                    connection.query('SELECT COUNT(*) as nb_access_request FROM access WHERE access_state="pending"', (error, nb_access_request_results, fields) => {
                        let nb_access_request = nb_access_request_results[0]['nb_access_request'];
                        connection.query('SELECT COUNT(*) as nb_material_request FROM materials WHERE material_state="pending"', (error, nb_material_request_result, fields) => {
                            let nb_material_request = nb_material_request_result[0]['nb_material_request'];
                            connection.query('SELECT COUNT(*) as nb_tickets FROM tickets WHERE ticket_state=1', (error, nb_tickets_results, fields) => {
                                let nb_tickets = nb_tickets_results[0]['nb_tickets'];
                                res.render('admin/admin-index.html.twig', {data: req.session, nb_users: nb_users, nb_cotiz: nb_cotiz, nb_access_request: nb_access_request, nb_material_request: nb_material_request, nb_tickets: nb_tickets});
                            });
                        });
                    });
                });
            });
        }
    });

    /*
     * Displays the list of all the users registered in the system
     * Displays all their attributes and the number of registered
     * MAC address per account
     */
    app.get('/admin/users/', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/admin/users/';
            res.redirect('/users/login/');
        }
        else if(!req.session['user_rank'] == 'admin'){
            res.redirect('/');
        }
        else {
            connection.query('SELECT *, COUNT(access_id) AS mac_count FROM `users` LEFT JOIN `access` ON users.user_id=access.access_user GROUP BY user_id', (errors, results, fields) => {
                res.render('admin/admin-users.html.twig', {data: req.session, user_list: results});
            });
        }
    });

    /*
     * Delete a user from users table based on its user_id (passed over GET)
     */
    app.get('/admin/users/delete-user/:user_id', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/admin/users/';
            res.redirect('/users/login/');
        }
        else {
            if(req.session['user_rank'] != "admin")
            {
                res.redirect('/');
            }
            else {
                connection.query('DELETE FROM users WHERE user_id = ?', [req.params.user_id], () => {
                    res.redirect('/admin/users/');
                });
            }
        }
    });

    /* 
     * Allow granting operation on users
     * To make them admin or downgrade them back to user
     * data (user_id and new user_rank) are passed over GET request
     */
    app.get('/admin/users/grant-user/:user_id/:user_rank', (req, res) => {
        let user_rank = req.params.user_rank;
        let user_id = req.params.user_id;
        if(!req.session['logged_in']){
            req.session.returnTo = '/admin/users/';
            res.redirect('/users/login/');
        }
        else {
            if(req.session['user_rank'] != "admin")
            {
                res.redirect('/');
            }
            else {
                connection.query('UPDATE users SET user_rank = ? WHERE user_id = ?', [user_rank, user_id], () => {
                    res.redirect('/admin/users/');
                });
            }
        }
    });
}