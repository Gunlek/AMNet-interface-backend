let mysql = require('mysql');
let md5 = require('md5');
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false});
let session = require('express-session');
let nodemailer = require('nodemailer');
let replace = require("stream-replace");
let fs = require("fs");
const axios = require('axios');

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
        secret: "amnet-interface",
        resave: false,
        saveUninitialized: false,
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
        connection.query('SELECT * FROM users WHERE user_email = ?', [email], (error, results, fields) => {
            if(results.length > 0){
                let user_id = results[0]['user_id'];
                connection.query('INSERT INTO reset_token(token_user, token_value) VALUES(?, ?)', [user_id, token_value]);

                let reset_link = "";
                if(process.env.DEBUG == "true")
                    reset_link = "http://localhost:8080/users/change_password/"+token_value;
                else
                    reset_link = "http://amnet.fr/users/change_password/"+token_value;
                var htmlstream = fs.createReadStream('mail_template.html').pipe(replace("<LINK_HERE>", reset_link)).pipe(replace("<ID_HERE>", results[0]['user_name']));
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
            }
        });
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
        
        connection.query('SELECT * FROM settings', (error, settings_results, fields) => {
            let settings = {};
            settings_results.forEach(param => {
                settings[param['setting_name']] = param['setting_value'].replace(/<br\/>/g, '\n');
            });
            res.render('users/signin.html.twig', {data: req.session, signin_failed: signin_failed, no_charte: no_charte, setting: settings});
        });
    });

    /*
     * Handle disconnection requests and redirect user to index
     */
    app.get('/users/disconnect/', (req, res) => {
        req.session['logged_in'] = false;
        req.session['user_id'] = -1;
        req.session['user_name'] = "";
        req.session['user_pay_status'] = "";
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
                req.session['user_pay_status'] = results[0]['user_pay_status'];
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
        let phone = req.body.phone;
        let bucque = req.body.bucque;
        let fams = req.body.fams;
        let password = md5(req.body.password);
        let password_conf = md5(req.body.password_confirmation);
        let charte = req.body.check_charte;

        const select_or_text = req.body.select_or_text;
        let proms = req.body.user_proms_select;
        if(select_or_text === "text"){
            proms = req.body.user_proms_text;
        }
        
        if((username !== "" && bucque !== "" && fams !== "" && proms !== "" && email !== "" && phone !== "") && password === password_conf){
            if(charte=="true"){
                connection.query('SELECT * FROM users WHERE user_name=?', [username], function(errors, results, fields){
                    if(results.length == 0){
                        connection.query('INSERT INTO users(user_name, user_firstname, user_lastname, user_email, user_phone, user_password, user_bucque, user_fams, user_proms) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', [username, firstname, lastname, email, phone, password, bucque, fams, proms]);
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
     * Display user's profile edition page
     */
    app.get('/user/profile/', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/user/profile/';
            res.redirect('/users/login/');
        }
        else {
            connection.query('SELECT * FROM users WHERE user_id = ?', [req.session['user_id']], (_, results, __) => {
                connection.query('SELECT * FROM settings', (error, settings_results, fields) => {
                    let settings = {};
                    settings_results.forEach(param => {
                        settings[param['setting_name']] = param['setting_value'].replace(/<br\/>/g, '\n');
                    });
                    if(results.length > 0){
                        res.render('users/profile.html.twig', {user_data: results[0], setting: settings});
                    }
                });
            });
        }
    });

    /*
     * Handle POST request to update user's profile based
     * on data from profile edition page
     */
    app.post('/user/process-profile-update/', urlencodedParser, (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/user/profile/';
            res.redirect('/users/login/');
        }
        else {
            const user_id = req.session['user_id'];
            
            const select_or_text = req.body.select_or_text;
            const user_name = req.body.user_name;
            const user_bucque = req.body.user_bucque;
            const user_firstname = req.body.user_firstname;
            const user_lastname = req.body.user_lastname;
            const user_fams = req.body.user_fams;
            const user_campus = req.body.user_campus;
            const user_email = req.body.user_email;
            const user_phone = req.body.user_phone;
            
            let user_proms = req.body.user_proms_select;
            if(select_or_text === "text"){
                user_proms = req.body.user_proms_text;
            }

            let user_password = req.body.user_password;
            let user_confPassword = req.body.user_confPassword;

            if(user_password != "" && user_confPassword != ""){
                user_password = md5(user_password);
                user_confPassword = md5(user_confPassword);
                if(user_password===user_confPassword){
                    connection.query('UPDATE users SET user_name=?, user_bucque=?, user_firstname=?, user_lastname=?, user_fams=?, user_campus=?, user_proms=?, user_email=?, user_phone=?, user_password=? WHERE user_id = ?', [user_name, user_bucque, user_firstname, user_lastname, user_fams, user_campus, user_proms, user_email, user_phone, user_password, user_id], (err, results, fields) => {
                        if(err) throw err;
                        res.redirect('/user/profile/');
                    });
                }
                else {
                    res.redirect('/user/profile/?err=1')
                }
            }
            else {
                connection.query('UPDATE users SET user_name=?, user_bucque=?, user_firstname=?, user_lastname=?, user_fams=?, user_campus=?, user_proms=?, user_email=?, user_phone=? WHERE user_id = ?', [user_name, user_bucque, user_firstname, user_lastname, user_fams, user_campus, user_proms, user_email, user_phone, user_id], (err, results, fields) => {
                    if(err) throw err;
                    res.redirect('/user/profile/');
                });
            }
        }
    });

    /**
     * Handle lydia payment REST request (request/do)
     */
    app.get('/user/payment/do/:user_phone', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/user/profile/';
            res.redirect('/users/login/');
        }
        else {
            let user_phone = req.params.user_phone;
            if(user_phone.length == 10 && user_phone[0] == "0")
                user_phone = "+33" + user_phone.substring(1);

            let parameters = new URLSearchParams();
            parameters.append("message", "Paiement cotisation AMNet");
            parameters.append("amount", process.env.LYDIA_COTISATION_PAYMENT_AMOUNT);
            parameters.append("currency", "EUR");
            parameters.append("type", "phone");
            parameters.append("recipient", user_phone);
            parameters.append("vendor_token", process.env.LYDIA_PUBLIC_VENDOR_TOKEN);
            parameters.append("payment_method", "auto");
            parameters.append("confirm_url", process.env.APP_DOMAIN + "/user/payment/success/");
            parameters.append("cancel_url", process.env.APP_DOMAIN + "/user/payment/cancel/");
            parameters.append("expire_url", process.env.APP_DOMAIN + "/user/payment/cancel/");
            parameters.append("browser_success_url", process.env.DEV ? "http://localhost:"+process.env.SERVER_PORT+"/" : process.env.APP_DOMAIN + "/");
            parameters.append("browser_fail_url ", process.env.DEV ? "http://localhost:"+process.env.SERVER_PORT+"/?payment_err=1" : process.env.APP_DOMAIN + "/?payment_err=1");
            parameters.append("display_confirmation", "no");
            
            axios({
                method: "POST",
                url: process.env.LYDIA_API_URL + '/api/request/do.json',
                data: parameters
            })
            .then((response) => {
                let { request_id, request_uuid, mobile_url } = response.data;
                connection.query('INSERT INTO lydia_transactions(request_id, request_uuid, request_amount, request_payer_id) VALUES(?, ?, ?, ?)', [request_id, request_uuid, process.env.LYDIA_COTISATION_PAYMENT_AMOUNT, req.session['user_id']], () => {
                    console.log(response.data);
                    res.redirect(mobile_url);
                });
            })
            .catch((err) => console.log(err));
        }
    });

    

    /**
     * Handle successful payment request
     */
    app.post('/user/payment/success/', urlencodedParser, (req, res) => {
        const { request_id, amount } = req.body;
        connection.query('SELECT * FROM lydia_transaction WHERE request_id = ?', [request_id], (err, results) => {
            if(err)
                console.log(err);
            if(results.length > 0){
                const user_id = results[0]['request_payer_id'];
                connection.query('DELETE FROM lydia_transaction WHERE request_id = ?', [request_id]);
                connection.query('UPDATE users SET user_pay_status = 1 WHERE user_id = ?', [user_id], () => {
                    res.redirect('/');
                });
            }
        });
    });

    /**
     * Handle cancelled / expired payment request
     */
    app.post('/user/payment/cancel/', urlencodedParser, (req, res) => {
        const { request_id, amount } = req.body;
        connection.query('DELETE FROM lydia_transaction WHERE request_id = ?', [request_id], () => {
            res.redirect('/');
        });
    });
}