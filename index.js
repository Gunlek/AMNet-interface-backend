let mysql = require('mysql');
var express = require('express');
let session = require('express-session');
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false});
let request = require('request');

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

app.get('/', (req, res) => {
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
    if(!req.session['logged_in']){
        req.session.returnTo = '/pay-cotiz/';
        res.redirect('/users/login/');
    }
    else
        res.render('users/pay-cotiz.html.twig', {data: req.session});
});

app.post('/action-pay-cotiz/', urlencodedParser, (req, res) => {
    if(!req.session['logged_in']){
        req.session.returnTo = '/pay-cotiz/';
        res.redirect('/users/login/');
    }
    else {
        if(req.body.lydia_phone != ""){
            request.post('https://homologation.lydia-app.com/api/request/do.json', {
                form: {
                    amount: '30',
                    recipient: req.body.lydia_phone,
                    vendor_token: process.env.LYDIA_TOKEN,
                    currency: 'EUR',
                    type: 'phone',
                    message: 'Paiement cotisation AMNet',
                    payment_method: 'lydia'
                    // TODO: Add confirm / cancel / expire URL and success / fail URL
                }
            }, (error, res, body) => {
                let json_result = JSON.parse(body);
                if(json_result.error == '0'){
                    console.log(json_result.request_id);
                    // TODO: Register request_id in database (new table => transactions)
                }
                else
                    console.log(body);
            });
        }
        else
            res.redirect('/pay-cotiz/');
    }
});

app.use(function(req, res, next){
    res.status(404).render('errors/404.html.twig', {data: req.session});
});

app.listen(process.env.SERVER_PORT);