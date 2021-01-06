const { DatabaseSingleton } = require('../utils/databaseSingleton');
const { EnableRadiusConnection } = require('../utils/radius/enableRadiusConnection');

require('dotenv').config();

const UserSuccessCotizPayment = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    if(req.session['logged_in']){
        database.query('SELECT * FROM users WHERE user_id=?', [req.session.user_id], (errors, results, fields) => {
            if(results.length > 0){
                req.session['user_pay_status'] = results[0]['user_pay_status'];

                if(req.session['user_pay_status'] == "1"){
                    if(process.env.RADIUS == "true"){
                        EnableRadiusConnection(req.session['user_name']);
                    }
                }
            }
        });
    }
    res.render('errors/payment_redirection.html.twig');
}

module.exports = { UserSuccessCotizPayment };
