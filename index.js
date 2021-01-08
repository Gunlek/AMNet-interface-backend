let mysql = require('mysql');
var express = require('express');
let session = require('express-session');
let cron = require('node-cron');
const adminRouter = require('./src/routes/adminRouter');
const userRouter = require('./src/routes/userRouter');
const { DatabaseSingleton } = require('./src/utils/databaseSingleton');
const ticketRouter = require('./src/routes/ticketRouter');
const materialRouter = require('./src/routes/materialRouter');
const internetRouter = require('./src/routes/internetRouter');
const { EnableRadiusConnection } = require('./src/utils/radius/enableRadiusConnection');
const { DisableRadiusConnection } = require('./src/utils/radius/disableRadiusConnection');

const { isUserLoggedIn } = require('./src/utils/isUserLoggedIn');

require('dotenv').config();

var app = express();

app.use(session({
    secret: "amnet-interface",
    resave: false,
    saveUninitialized: false,
}));

app.use(express.urlencoded({ extended: true }));

app.use('/users', userRouter);
app.use('/internet', internetRouter);
app.use('/material', materialRouter);
app.use('/tickets', ticketRouter);
app.use('/admin', adminRouter);

require('./src/api/api')(app);              // Handle API actions

app.use(express.static('statics'));

cron.schedule('58 23 * * *', () => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    if(process.env.RADIUS == 'true'){
        database.query('SELECT * FROM users', (errors, results, fields) => {
            results.forEach((user) => {
                if(user['user_pay_status'] == '1'){
                    EnableRadiusConnection(user['user_name']);
                }
                else {
                    DisableRadiusConnection(user['user_name']);
                }
            });
        });
    }
});

app.get('/', (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    if(!req.session['logged_in'])
        res.redirect('users/login/');
    else {
        database.query('SELECT * FROM settings', (error, settings_results, fields) => {
            let settings = {};
            settings_results.map((param) => {
                settings[param['setting_name']] = param['setting_value']
            });

            database.query('SELECT user_pay_status FROM users WHERE user_id = ?', [req.session['user_id']], (err, result) => {
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