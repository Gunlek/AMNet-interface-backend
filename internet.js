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
     * Displays the list of all the requested access for the currently logged-in
     * user
     */
    app.get('/internet/', (req, res) => {
        if(!req.session['logged_in']) {
            req.session.returnTo = '/internet/';
            res.redirect('/users/login/');
        }
        else {
            if(req.session['user_pay_status'] == 0)
                res.redirect('/pay-cotiz/');
            else {
                connection.query('SELECT * FROM access WHERE access_user = ?', [req.session.user_id], function(error, results, fields){
                    res.render('internet/list-access.html.twig', {data: req.session, access_list: results});
                });
            }
        }
    })

    /*
     * Delete a request created by user
     */
    app.get('/internet/delete/:user_id/:access_id/', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/internet/';
            res.redirect('/users/login/');
        }
        else {
            connection.query('SELECT * FROM access WHERE access_id = ? AND access_user = ?', [req.params.access_id, req.params.user_id], function(errors, results, fields){
                if(results.length > 0){
                    connection.query('DELETE FROM access WHERE access_id = ?', [req.params.access_id]);
                    res.redirect('/internet/');
                }
                else {
                    res.redirect('/users/login/');
                }
            });
        }
    });

    /*
     * Handle request adding, gathering data from access-request form
     */
    app.post('/internet/add-request/', urlencodedParser, (req, res) => {
        let mac_addr = req.body.mac_addr.replace(/-/g, ':');
        let description = req.body.description;
        let user_id = req.body.user_id;

        connection.query('INSERT INTO access(access_description, access_mac, access_user) VALUES(?, ?, ?)', [description, mac_addr, user_id], () => {
            res.redirect('/internet/');
        });
    });
}