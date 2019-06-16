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

    app.get('/internet/list-access/', (req, res) => {
        if(!req.session['logged_in'])
            res.redirect('/access/login/');
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
                connection.query('DELETE FROM access WHERE access_id = ?', [req.query.access_id]);
                res.redirect('/internet/list-access');
            }
            else {
                res.redirect('/access/login/');
            }
        });
    });
}