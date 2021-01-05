let mysql = require('mysql');
var express = require('express');
let session = require('express-session');
let cron = require('node-cron');


require('dotenv').config();

let connection = mysql.createConnection({
    host    :   process.env.DB_HOST,
    user    :   process.env.DB_USER,
    password:   process.env.DB_PASS,
    database:   process.env.DB_NAME
});

connection.connect();

var app = express();

app.use(session({
    secret: "amnet-interface",
    resave: false,
    saveUninitialized: false,
}));

require('./users')(app);            // Handle all requests from user management
require('./internet')(app);         // Handle management of internet requests and access
require('./material')(app);         // Handle management of material requests and access
require('./tickets')(app);          // Handle management of tickets and user-requests
require('./admin')(app);            // Handle all administration interfaces and actions

require('./api')(app);              // Handle API actions

app.use(express.static('statics'));

let radiusConnection;
if(process.env.RADIUS == 'true'){
    radiusConnection = mysql.createConnection({
        host    :   process.env.RADIUS_DB_HOST,
        user    :   process.env.RADIUS_DB_USER,
        password:   process.env.RADIUS_DB_PASS,
        database:   process.env.RADIUS_DB_NAME
    });

    radiusConnection.connect();
}

cron.schedule('58 23 * * *', () => {
    if(process.env.RADIUS == 'true'){
        connection.query('SELECT * FROM users', (errors, results, fields) => {
            results.forEach((user) => {
                if(user['user_pay_status'] == '1'){
                    radiusConnection.query('UPDATE radusergroup SET groupname="pgmoyss" WHERE username=?', [user['user_name']], (err) => {
                        if(err)
                            console.log(err)
                    });
                }
                else {
                    radiusConnection.query('UPDATE radusergroup SET groupname="daloRADIUS-Disabled-Users" WHERE username=?', [user['user_name']], (err) => {
                        if(err)
                            console.log(err)
                    });
                }
            });
        });
    }
});

app.get('/', (req, res) => {
    if(!req.session['logged_in'])
        res.redirect('users/login/');
    else {
        connection.query('SELECT * FROM settings', (error, settings_results, fields) => {
            let settings = {};
            settings_results.map((param) => {
                settings[param['setting_name']] = param['setting_value']
            });

            connection.query('SELECT user_pay_status FROM users WHERE user_id = ?', [req.session['user_id']], (err, result) => {
                if(result.length > 0)
                    res.render('index.html.twig', {data: req.session, setting: settings, cotiz_paid: result[0]['user_pay_status'], payment_err: req.query['payment_err'] == "1" ? true : false});
            });
        });
    }
});

app.use(function(req, res, next){
    res.status(404).render('errors/404.html.twig', {data: req.session});
});

app.listen(process.env.SERVER_PORT);