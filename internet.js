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
        secret: "amnet-interface"
    }));

    app.get('/internet/list-access/', (req, res) => {
        if(!req.session['logged_in']) {
            req.session.returnTo = '/internet/list-access/';
            res.redirect('/access/login/');
        }
        else {
            let access_list = [];
            connection.query('SELECT * FROM access WHERE access_user = ?', [1], function(error, results, fields){
                res.render('internet/list-access.html.twig', {data: req.session, access_list: results});
            });
        }
    })

    app.get('/internet/policy/', (req, res) => {
        res.render('internet/policy.html.twig', {data: req.session});
    });

    app.get('/internet/delete-access/', (req, res) => {
        connection.query('SELECT * FROM access WHERE access_id = ? AND access_user = ?', [req.query.access_id, req.query.user_id], function(errors, results, fields){
            if(results.length > 0){
                connection.query('INSERT INTO admin_actions(action_type, action_user, action_data) VALUES("delete-access", ?, ?)', [req.query.user_id, results[0]['access_mac']]);
                connection.query('DELETE FROM access WHERE access_id = ?', [req.query.access_id]);
                res.redirect('/internet/list-access');
            }
            else {
                res.redirect('/access/login/');
            }
        });
    });

    app.get('/internet/access-request/', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/internet/access-request/';
            res.redirect('/access/login/');
        }
        else {
            res.render('internet/access-request.html.twig', {data: req.session});
        }
    });

    app.post('/internet/add-request/', urlencodedParser, (req, res) => {
        let mac_addr = req.body.mac_addr;
        let description = req.body.description;
        let user_id = req.body.user_id;

        connection.query('INSERT INTO admin_actions(action_type, action_user, action_data) VALUES("add-access", ?, ?)', [user_id, "mac_addr="+mac_addr+";description="+description]);
        connection.query('INSERT INTO access(access_description, access_mac, access_ip, access_user) VALUES(?, ?, ?, ?)', [description, mac_addr, "", user_id], () => {
            res.redirect('/internet/list-access/');
        });
    });
}