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

module.exports = (app) => {

    app.use(session({
        secret: "amnet-interface",
        resave: false,
        saveUninitialized: false,
    }));

    /*
     * Displays the list of all the requested hardware for the currently logged-in
     * user
     */
    app.get('/material/', (req, res) => {
        if(!req.session['logged_in']){
            req.session.returnTo = '/material/';
            res.redirect('/users/login/');
        }
        else {
            if(req.session['user_pay_status'] == 0)
                res.redirect('/pay-cotiz/');
            else {
                connection.query('SELECT * FROM materials WHERE material_user = ?', [1], function(error, results, fields){
                    res.render('material/list-requests.html.twig', {data: req.session, requests_list: results});
                });
            }
        }
    });

    /*
     * Handle request adding, gathering data from access-request form
     */
    app.post('/material/add-request/', urlencodedParser, (req, res) => {
        let description = req.body.description;
        let user_id = req.body.user_id;

        connection.query('INSERT INTO admin_actions(action_type, action_user, action_data) VALUES("material-request", ?, ?)', [user_id, "description="+description]);
        connection.query('INSERT INTO materials(material_user, material_description) VALUES(?, ?)', [user_id, description], () => {
            res.redirect('/material/');
        });
    });
}