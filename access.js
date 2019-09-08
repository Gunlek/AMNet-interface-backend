let mysql = require('mysql');
let md5 = require('md5');
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

    app.get('/access/login/', (req, res) => {
        let login_failed = false;
        if(req.query.state != null && req.query.state === "failed")
            login_failed = true;
        res.render('access/login.html.twig', {data: req.session, login_failed: login_failed});
    });

    app.get('/access/signin/', (req, res) => {
        let signin_failed = false;
        if(req.query.state != null && req.query.state === "failed")
            signin_failed = true;
        res.render('access/signin.html.twig', {data: req.session, signin_failed: signin_failed});
    });

    app.get('/access/disconnect/', (req, res) => {
        req.session['logged_in'] = false;
        req.session['user_id'] = -1;
        req.session['user_name'] = "";
        res.redirect('/');
    });

    app.post('/access/process_login/', urlencodedParser, (req, res) => {
        connection.query('SELECT * FROM users WHERE user_name=? AND user_password=?', [req.body.username, md5(req.body.password)], (error, results, fields) => {
            if(results.length > 0)
            {
                req.session['logged_in'] = true;
                req.session['user_id'] = parseInt(results[0]['user_id']);
                req.session['user_name'] = req.body.username;
                req.session['user_rank'] = results[0]['user_rank'];
                let returnURL = "/";
                if(req.session.returnTo != null)
                    returnURL = req.session.returnTo;
                res.redirect(returnURL);
            }
            else
                res.redirect('/access/login/?state=failed');
        });
    });

    app.post('/access/process_signin/', urlencodedParser, (req, res) => {
        let username = req.body.username;
        let firstname = req.body.firstname;
        let lastname = req.body.lastname;
        let email = req.body.email;
        let bucque = req.body.bucque;
        let fams = req.body.fams;
        let proms = req.body.proms;
        let password = md5(req.body.password);
        let password_conf = md5(req.body.password_confirmation);

        if((username != "" && bucque != "" && fams != "" && proms != "" && email!="") && password == password_conf){
            connection.query('SELECT * FROM users WHERE user_name=?', [username], function(errors, results, fields){
                if(results.length == 0){
                    connection.query('INSERT INTO users(user_name, user_firstname, user_lastname, user_email, user_password, user_bucque, user_fams, user_proms) VALUES(?, ?, ?, ?, ?, ?, ?, ?)', [username, firstname, lastname, email, password, bucque, fams, proms]);
                    res.redirect('/access/login/');
                }
                else
                    res.redirect('/access/signin/?state=failed');
            });
        }
        else
            res.redirect('/access/signin/?state=failed');
    });

    app.get('/user/profile/:user_id', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/internet/admin-access/';
            res.redirect('/access/login/');
        }
        else {
            if(req.session['user_rank'] != "admin")
            {
                res.redirect('/');
            }
            else {
                if(req.params.user_id != ""){
                    connection.query('SELECT * FROM users WHERE user_id = ?', [parseInt(req.params.user_id)], (errors, results, fields) => {
                        if(results.length > 0)
                            res.render('access/profile.html.twig', {data: req.session, user_data: results[0]})
                    });
                }
            }
        }
    });

}