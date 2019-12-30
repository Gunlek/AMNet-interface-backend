let mysql = require('mysql');
var express = require('express');
let session = require('express-session');
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

require('./users')(app);           // Handle all requests from user management
require('./internet')(app);         // Handle management of internet requests and access
require('./material')(app);         // Handle management of material requests and access
require('./tickets')(app);          // Handle management of tickets and user-requests
require('./admin')(app);          // Handle all administration interfaces and actions

app.use(express.static('statics'));

app.get('/', (req, res) => {
<<<<<<< HEAD
    res.render('index.html.twig', {data: req.session});
=======
    if(!req.session['logged_in'])
        res.redirect('users/login/');
    else {
        connection.query('SELECT * FROM settings', (error, settings_results, fields) => {
            let settings = {};
            settings_results.forEach(param => {
                settings[param['setting_name']] = param['setting_value']
            });
            
            res.render('index.html.twig', {data: req.session, setting: settings});
        });
    }
});

app.get('/pay-cotiz/', (req, res) => {
    if(!req.session['logged_in'])
        res.redirect('users/login/');
    else
        res.render('users/pay-cotiz.html.twig', {data: req.session});
>>>>>>> design_update
});

app.use(function(req, res, next){
    res.status(404).render('errors/404.html.twig', {data: req.session});
});

app.listen(8080);