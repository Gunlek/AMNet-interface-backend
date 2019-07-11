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

    app.get('/internet/admin-access/', (req, res) => {
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
                req.session.returnTo = '/access/admin-access/';
                connection.query('SELECT * FROM access', (errors, requests, fields) => {
                    connection.query('SELECT * FROM users', (errors, users, fields) => {
                        let user_list = {};
                        for(let k = 0; k < users.length; k++){
                            let user = users[k];
                            user_list[user['user_id']] = {user_id: user['user_id'], user_name: user['user_name'], user_bucque: user['user_bucque'], user_fams: user['user_fams'], user_proms: user['user_proms'], user_rank: user['user_rank']}
                            if(k == users.length - 1)
                                res.render('internet/admin-access.html.twig', {data: req.session, requests: requests, user_list: user_list});
                        }
                    });
                });
            }
        }
    });

    app.get('/internet/allow/:access_id', (req, res) => {
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
                let access_id = parseInt(req.params.access_id);
                console.log(access_id);
                connection.query('UPDATE access SET access_state = "active" WHERE access_id = ?', [access_id], () => {
                    res.redirect('/internet/admin-access');
                });
            }
        }
    });

    app.get('/internet/disallow/:access_id', (req, res) => {
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
                let access_id = parseInt(req.params.access_id);
                console.log(access_id);
                connection.query('UPDATE access SET access_state = "suspended" WHERE access_id = ?', [access_id], () => {
                    res.redirect('/internet/admin-access');
                });
            }
        }
    });

}