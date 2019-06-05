let mysql = require('mysql');
let md5 = require('md5');
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false});

let connection = mysql.createConnection({
    host    :   'localhost',
    user    :   'root',
    password:   '',
    database:   'amnet_birse'
});

connection.connect();

module.exports = (app, data) => {

    app.get('/access/login/', (req, res) => {
        let login_failed = false;
        if(req.query.state != null && req.query.state === "failed")
            login_failed = true;
        res.render('access/login.html.twig', {data: data, login_failed: login_failed});
    });

    app.get('/access/signin/', (req, res) => {
        let signin_failed = false;
        if(req.query.state != null && req.query.state === "failed")
            signin_failed = true;
        res.render('access/signin.html.twig', {data: data, signin_failed: signin_failed});
    });

    app.get('/access/disconnect/', (req, res) => {
        data.logged_in = false;
        res.redirect('/');
    });

    app.post('/access/process_login/', urlencodedParser, (req, res) => {
        connection.query('SELECT * FROM users WHERE user_name=? AND user_password=?', [req.body.username, md5(req.body.password)], (error, results, fields) => {
            if(results.length > 0)
            {
                data.logged_in = true;
                res.redirect('/');
            }
            else
                res.redirect('/access/login/?state=failed');
        });
    });

    app.post('/access/process_signin/', urlencodedParser, (req, res) => {
        let username = req.body.username;
        let bucque = req.body.bucque;
        let fams = req.body.fams;
        let proms = req.body.proms;
        let email = req.body.email;
        let password = md5(req.body.password);
        let password_conf = md5(req.body.password_confirmation);

        if((username != "" && bucque != "" && fams != "" && proms != "" && email!="") && password == password_conf){
            connection.query('SELECT * FROM users WHERE user_name=?', [username], function(errors, results, fields){
                if(results.length == 0){
                    connection.query('INSERT INTO users(user_name, user_password, user_bucque, user_fams, user_proms) VALUES(?, ?, ?, ?, ?)', [username, password, bucque, fams, proms]);
                    res.redirect('/access/login/');
                }
                else
                    res.redirect('/access/signin/?state=failed');
            });
        }
        else
            res.redirect('/access/signin/?state=failed');
    });

}