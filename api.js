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
     * Count registered (active, pending or suspended) mac address per users for all users
     * Output: JSON Array
     */
    app.get('/api/users/count-mac', (req, res) => {
        connection.query('SELECT user_id, COUNT(access_id) AS mac_count FROM `users` LEFT JOIN `access` ON users.user_id=access.access_user GROUP BY user_id', (errors, results, fields) => {
            res.json(results);
        });
    });

    /*
     * Count registered (active, pending or suspended) mac address per users for a specific user
     * Input: The specific user_id, integer, included in URL
     * Output: JSON Array
     */
    app.get('/api/users/count-mac/:user_id', (req, res) => {
        connection.query('SELECT mac_count FROM ((SELECT user_id, COUNT(access_id) AS mac_count FROM `users` LEFT JOIN `access` ON users.user_id=access.access_user GROUP BY user_id) AS P) WHERE user_id=?', [req.params.user_id], (errors, results, fields) => {
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
     * Retrieve and list all pending access requests
     */
    app.get('/api/access/list-pendings', (req, res) => {
        connection.query('SELECT * FROM users INNER JOIN access ON users.user_id = access.access_user WHERE access.access_state = "pending"', (errors, results, fields) => {
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
     *      - access_id, integer,
     *      - api_token, string
     *      - access_ description, string, optional
     *      - access_mac, string, optional
     *      - access_user, integer, optional
     *      - access_state, string in [active, pending, suspended], optional
     */
    app.post('/api/access/update', urlencodedParser, (req, res) => {
        if(req.body.access_id != null && req.body.api_token != null){
            connection.query('SELECT setting_value AS api_token FROM settings WHERE setting_name="api_token"', (errors, results, fields) => {
                if(results.length > 0){
                    if(results[0]['api_token'] == req.body.api_token){
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
                        res.send('Invalid API token');
                }
                else
                    res.send('Internal error during API token search');
            });
        }
        else
            res.send("Missing argument: access_id or api_token not specified");
    });

};