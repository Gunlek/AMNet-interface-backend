let mysql = require('mysql');
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false});
let session = require('express-session');

let connection = mysql.createConnection({
    host    :   'localhost',
    user    :   'root',
    password:   '',
    database:   'amnet_birse'
});

connection.connect();

module.exports = (app) => {

    app.use(session({
        secret: "amnet-interface"
    }));

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
    })

    app.get('/material/material-request/', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/material/material-request/';
            res.redirect('/access/login/');
        }
        else {
            res.render('material/request-material.html.twig', {data: req.session});
        }
    });

    app.post('/material/add-request/', urlencodedParser, (req, res) => {
        let description = req.body.description;
        let user_id = req.body.user_id;

        connection.query('INSERT INTO admin_actions(action_type, action_user, action_data) VALUES("material-request", ?, ?)', [user_id, "description="+description]);
        connection.query('INSERT INTO materials(material_user, material_description) VALUES(?, ?)', [user_id, description], () => {
            res.redirect('/material/list-requests/');
        });
    });
}