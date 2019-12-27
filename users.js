let mysql = require('mysql');
let md5 = require('md5');
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false});
let session = require('express-session');
let nodemailer = require('nodemailer');
let replace = require("stream-replace");
let fs = require("fs");

require('dotenv').config();

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWD
    }
})

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
        secret: "amnet-interface"
    }));

    /*
     * Displays lost-password page
     */
    app.get('/users/lost_password/', (req, res) => {
        res.render('users/lost-password.html.twig', {data: req.session});
    });

    /*
     * Handle post request from lost-password form
     * Get email address from form, generate a unique token that corresponds
     * to the resetting request and send an email to this address using
     * the specified GMail account containing the address to the specific token
     */
    app.post('/users/process_lost_password/', urlencodedParser, (req, res) => {
        let email = req.body.email;
        let token_value = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        connection.query('SELECT user_id FROM users WHERE user_email = ?', [email], (error, results, fields) => {
            if(results.length > 0){
                let user_id = results[0]['user_id'];
                connection.query('INSERT INTO reset_token(token_user, token_value) VALUES(?, ?)', [user_id, token_value]);
            }
        });
        let reset_link = "";
        if(process.env.DEBUG == "true")
            reset_link = "http://localhost:8080/access/change_password/"+token_value;
        else
            reset_link = "http://89.92.31.117/access/change_password/"+token_value;
        var htmlstream = fs.createReadStream('mail_template.html').pipe(replace("<LINK_HERE>", reset_link));
        let mailOptions = {
            from: 'presidentamnet@gmail.com',
            to: email,
            subject: 'Réinitialisation de mot de passe',
            html: htmlstream
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if(error){
                htmlstream.close();
            }
        });
        res.redirect('/users/login/');
    });

    /*
     * Displays the reset-password page that correspond to the specified
     * token (via GET)
     */
    app.get('/users/change_password/:token', (req, res ) => {
        let token = req.params.token;
        let password_change_failed = false;
        if(req.query.state != null && req.query.state === "failed")
            password_change_failed = true;
        res.render('users/change_password.html.twig', {data: req.session, token: token, password_change_failed: password_change_failed});
    });

    /*
     * Handle POST request from reset-password page
     * Reset the password in SQL, gathering corresponding user (linked via token) and
     * update its account password
     */
    app.post('/users/update_password', urlencodedParser, (req, res) => {
        let password = md5(req.body.password);
        let conf_password = md5(req.body.conf_password);
        let token = req.body.token;
        if(password === conf_password){
            connection.query("SELECT token_user FROM reset_token WHERE token_value=?", [token], (errors, results, fields) => {
                if(results.length > 0){
                    connection.query("UPDATE users SET user_password = ? WHERE user_id = ?", [password, results[0]["token_user"]], () => {
                        connection.query("DELETE FROM reset_token WHERE token_value = ?", [token], () => {
                            res.redirect('/users/login');
                        });
                    });
                }
            });
        }
        else{
            res.redirect('/users/change_password/'+token+'?state=failed');
        }
    });

    /*
     * Displays the log-in page
     */
    app.get('/users/login/', (req, res) => {
        let login_failed = false;
        if(req.query.state != null && req.query.state === "failed")
            login_failed = true;
        res.render('users/login.html.twig', {data: req.session, login_failed: login_failed});
    });
    
    /*
     * Displays the sign-in page
     */
    app.get('/users/signin/', (req, res) => {
        let signin_failed = false;
        let no_charte = false;
        if(req.query.state != null && req.query.state === "signin_failed")
            signin_failed = true;
        if(req.query.state != null && req.query.state === "no_charte")
            no_charte = true;
        res.render('users/signin.html.twig', {data: req.session, signin_failed: signin_failed, no_charte: no_charte});
    });

    /*
     * Handle disconnection requests and redirect user to index
     */
    app.get('/users/disconnect/', (req, res) => {
        req.session['logged_in'] = false;
        req.session['user_id'] = -1;
        req.session['user_name'] = "";
        res.redirect('/');
    });

    /*
     * Handle POST request from log-in page
     * Check if they are registered in the database and if username/password corresponds
     */
    app.post('/users/process_login/', urlencodedParser, (req, res) => {
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
                res.redirect('/users/login/?state=failed');
        });
    });

    /*
     * Handle POST request from sign-in page
     * Gather username, firstname, lastname, email, bucque, fams, proms and password from
     * form and check if password and conf_password corresponds
     * then register the newly created user to the database and redirect to log-in
     */
    app.post('/users/process_signin/', urlencodedParser, (req, res) => {
        let username = req.body.username;
        let firstname = req.body.firstname;
        let lastname = req.body.lastname;
        let email = req.body.email;
        let bucque = req.body.bucque;
        let fams = req.body.fams;
        let proms = req.body.proms;
        let password = md5(req.body.password);
        let password_conf = md5(req.body.password_confirmation);
        let charte = req.body.check_charte;
        
        if((username != "" && bucque != "" && fams != "" && proms != "" && email!="") && password == password_conf){
            if(charte=="true"){
                connection.query('SELECT * FROM users WHERE user_name=?', [username], function(errors, results, fields){
                    if(results.length == 0){
                        connection.query('INSERT INTO users(user_name, user_firstname, user_lastname, user_email, user_password, user_bucque, user_fams, user_proms) VALUES(?, ?, ?, ?, ?, ?, ?, ?)', [username, firstname, lastname, email, password, bucque, fams, proms]);
                        res.redirect('/users/login/');
                    }
                    else
                        res.redirect('/users/signin/?state=signin_failed');
                });
            }
            else
                res.redirect('/users/signin/?state=no_charte');
        }
        else
            res.redirect('/users/signin/?state=signin_failed');
    });

    /*
     * Displays the specific profile page
     * Allows admin to check a specific profile from tables
     */
    app.get('/users/profile/:user_id', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/users/profile/'+req.params.user_id;
            res.redirect('/users/login/');
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
                            res.render('users/profile.html.twig', {data: req.session, user_data: results[0]})
                    });
                }
            }
        }
    });

    /*
     * Displays the list of all the users registered in the system
     * Displays all their attributes and the number of registered
     * MAC address per account
     */
    app.get('/users/list-users/', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/users/list-users/';
            res.redirect('/users/login/');
        }
        else {
            if(req.session['user_rank'] != "admin")
            {
                res.redirect('/');
            }
            else {
                connection.query('SELECT *, COUNT(access_id) AS mac_count FROM `users` LEFT JOIN `access` ON users.user_id=access.access_user GROUP BY user_id', (errors, results, fields) => {
                    res.render('users/list_users.html.twig', {data: req.session, user_list: results});
                });
            }
        }
    });

    /*
     * Delete a user from users table based on its user_id (passed over GET)
     */
    app.get('/users/delete-user/:user_id', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/users/list-users/';
            res.redirect('/users/login/');
        }
        else {
            if(req.session['user_rank'] != "admin")
            {
                res.redirect('/');
            }
            else {
                connection.query('DELETE FROM users WHERE user_id = ?', [req.params.user_id], () => {
                    res.redirect('/users/list-users/');
                });
            }
        }
    });

    /* 
     * Allow granting operation on users
     * To make them admin or downgrade them back to user
     * data (user_id and new user_rank) are passed over GET request
     */
    app.get('/users/grant-user/:user_id/:user_rank', (req, res) => {
        let user_rank = req.params.user_rank;
        let user_id = req.params.user_id;
        if(!req.session['logged_in']){
            req.session.returnTo = '/users/list-users/';
            res.redirect('/users/login/');
        }
        else {
            if(req.session['user_rank'] != "admin")
            {
                res.redirect('/');
            }
            else {
                connection.query('UPDATE users SET user_rank = ? WHERE user_id = ?', [user_rank, user_id], () => {
                    res.redirect('/users/list-users/');
                });
            }
        }
    });

}