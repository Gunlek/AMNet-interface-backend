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

module.exports = (app) => {

    app.use(session({
        secret: "amnet-interface",
        resave: false,
        saveUninitialized: false,
    }));

    /*
     * Displays the list of all the requested hardware for the currently logged-in
     * user
     */
    app.get('/material/list-requests/', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/material/list-requests/';
            res.redirect('/access/login/');
        }
        else {
            connection.query('SELECT * FROM materials WHERE material_user = ?', [1], function(error, results, fields){
                res.render('material/list-requests.html.twig', {data: req.session, requests_list: results});
            });
        }
    });

    /*
     * Displays a form to allow user to request new
     * material
     */
    app.get('/material/material-request/', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/material/material-request/';
            res.redirect('/access/login/');
        }
        else {
            res.render('material/request-material.html.twig', {data: req.session});
        }
    });

    /*
     * Handle request adding, gathering data from access-request form
     */
    app.post('/material/add-request/', urlencodedParser, (req, res) => {
        let description = req.body.description;
        let user_id = req.body.user_id;

        connection.query('INSERT INTO admin_actions(action_type, action_user, action_data) VALUES("material-request", ?, ?)', [user_id, "description="+description]);
        connection.query('INSERT INTO materials(material_user, material_description) VALUES(?, ?)', [user_id, description], () => {
            res.redirect('/material/list-requests/');
        });
    });

    /*
     * Gather all the currently saved requests of hardware and display them
     * in tables to allow easier management from administrators
     */
    app.get('/material/admin-requests/', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/material/admin-requests/';
            res.redirect('/access/login/');
        }
        else {
            if(req.session['user_rank'] != "admin")
            {
                res.redirect('/');
            }
            else {
                req.session.returnTo = '/access/admin-access/';
                connection.query('SELECT * FROM materials WHERE material_state="granted"', (errors, granted_requests, fields) => {
                    connection.query('SELECT * FROM materials WHERE material_state="declined"', (errors, declined_requests, fields) => {
                        connection.query('SELECT * FROM materials WHERE material_state="pending"', (errors, pending_requests, fields) => {
                            connection.query('SELECT * FROM users', (errors, users, fields) => {
                                let user_list = {};
                                for(let k = 0; k < users.length; k++){
                                    let user = users[k];
                                    user_list[user['user_id']] = {user_id: user['user_id'], user_name: user['user_name'], user_bucque: user['user_bucque'], user_fams: user['user_fams'], user_proms: user['user_proms'], user_rank: user['user_rank']}
                                    if(k == users.length - 1)
                                        res.render('material/admin-requests.html.twig', {data: req.session, granted_requests: granted_requests, declined_requests: declined_requests, pending_requests: pending_requests, user_list: user_list});
                                }
                            });
                        });
                    });
                });
            }
        }
    });

    /*
     * Allows an administrator to mark a hardware request as "agreed"
     */
    app.get('/material/allow/:material_id', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/material/admin-requests/';
            res.redirect('/access/login/');
        }
        else {
            if(req.session['user_rank'] != "admin")
            {
                res.redirect('/');
            }
            else {
                let material_id = parseInt(req.params.material_id);
                connection.query('UPDATE materials SET material_state = "granted" WHERE material_id = ?', [material_id], () => {
                    res.redirect('/material/admin-requests/');
                });
            }
        }
    });

    /*
     * Allows an administrator to mark a hardware request as "declined"
     */
    app.get('/material/disallow/:material_id', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/material/admin-requests/';
            res.redirect('/access/login/');
        }
        else {
            if(req.session['user_rank'] != "admin")
            {
                res.redirect('/');
            }
            else {
                let material_id = parseInt(req.params.material_id);
                connection.query('UPDATE materials SET material_state = "declined" WHERE material_id = ?', [material_id], () => {
                    res.redirect('/material/admin-requests/');
                });
            }
        }
    });

    /*
     * Delete a hardware request created by user
     * Only possible for administrators
     */
    app.get('/material/delete/:material_id', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/material/admin-requests/';
            res.redirect('/access/login/');
        }
        else {
            if(req.session['user_rank'] != "admin")
            {
                res.redirect('/');
            }
            else {
                let material_id = parseInt(req.params.material_id);
                connection.query('DELETE FROM materials WHERE material_id = ?', [material_id], () => {
                    res.redirect('/material/admin-requests/');
                });
            }
        }
    });
}