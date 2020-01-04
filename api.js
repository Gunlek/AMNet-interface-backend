let mysql = require('mysql');
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false});
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

    /*
     * Retrieve and list all registered users on
     * current installation of the app
     * Output: JSON Array
     */
    app.get('/api/users/list', (req, res) => {
        connection.query('SELECT user_id, user_name, user_firstname, user_lastname, user_email, user_bucque, user_fams, user_proms, user_pay_status, user_rank FROM users', (errors, results, fields) => {
            res.json(results);
        });
    });

    /*
     * Retrieve and list all internet access requests
     * Output: JSON Array
     */
    app.get('/api/access/list', (req, res) => {
        connection.query('SELECT access_id, access_description, access_mac, access_user, access_state FROM access', (errors, results, fields) => {
            res.json(results);
        });
    });

    /*
     * Retrieve and list all materials requests
     * Output: JSON Array
     */
    app.get('/api/materials/list', (req, res) => {
        connection.query('SELECT material_id, material_user, material_description, material_state FROM materials', (errors, results, fields) => {
            res.json(results);
        });
    });

    /*
     * Update the access that correspond to the Iid
     * Input: POST request containing:
     *      - access_id, integer
     *      - access_ description, string, optional
     *      - access_mac, string, optional
     *      - access_user, integer, optional
     *      - access_state, string in [active, pending, suspended], optional
     */
    app.post('/api/access/update', urlencodedParser, (req, res) => {
        if(req.body.access_id != null){
            connection.query('SELECT access_id, access_description, access_mac, access_user, access_state FROM access WHERE access_id = ?', [req.body.access_id], (errors, results, fields) => {
                if(results.length > 0){
                    let access_id = req.body.access_id;
                    let access_description = (req.body.access_description != null) ? req.body.access_description : results[0]['access_description'];
                    let access_mac = (req.body.access_mac != null) ? req.body.access_mac : results[0]['access_mac'];
                    let access_user = (req.body.access_user != null) ? req.body.access_user : results[0]['access_user'];
                    let access_state = (req.body.access_state != null) ? req.body.access_state : results[0]['access_state'];
                    connection.query('UPDATE access SET access_description = ?, access_mac = ?, access_user = ?, access_state = ? WHERE access_id = ?', [access_description, access_mac, access_user, access_state, access_id], () => {
                        res.send("Success");
                    });
                }
                else
                    res.send("No result for specified access_id");
            });
        }
        else
            res.send("Missing argument: access_id not specified");
    });

};