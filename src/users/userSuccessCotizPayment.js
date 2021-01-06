const { DatabaseSingleton } = require('../utils/databaseSingleton');

require('dotenv').config();

const UserSuccessCotizPayment = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    if(req.session['logged_in']){
        database.query('SELECT * FROM users WHERE user_id=?', [req.session.user_id], (errors, results, fields) => {
            if(results.length > 0){
                req.session['user_pay_status'] = results[0]['user_pay_status'];

                if(req.session['user_pay_status'] == "1"){
                    if(process.env.RADIUS == "true"){
                        let radiusConnection = mysql.createConnection({
                            host    :   process.env.RADIUS_DB_HOST,
                            user    :   process.env.RADIUS_DB_USER,
                            password:   process.env.RADIUS_DB_PASS,
                            database:   process.env.RADIUS_DB_NAME
                        });
                        
                        radiusConnection.connect();
                        radiusConnection.query('UPDATE radusergroup SET groupname="pgmoyss" WHERE username=?', [username], (err) => {
                            if(err)
                                console.log(err)
                        });
                        radiusConnection.end();
                    }
                }
            }
        });
    }
    res.render('errors/payment_redirection.html.twig');
}

module.exports = { UserSuccessCotizPayment };
