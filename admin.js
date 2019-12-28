let mysql = require('mysql');
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

// In all renderers, data corresponds to the data saved in the current session

module.exports = (app) => {

    app.use(session({
        secret: "amnet-interface"
    }));

    /*
     * Displays the index page of administration
     */
    app.get('/admin/', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/admin/';
            res.redirect('/users/login/');
        }
        else if(!req.session['user_rank'] == 'admin'){
            res.redirect('/');
        }
        else {
            res.render('admin/admin-index.html.twig', {data: req.session});
        }
    });
}