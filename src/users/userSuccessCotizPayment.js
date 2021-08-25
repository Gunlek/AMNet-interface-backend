const { DatabaseSingleton } = require('../utils/databaseSingleton');

require('dotenv').config();

const UserSuccessCotizPayment = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    database.query('SELECT * FROM users WHERE user_id=?', [req.session.user_id], (errors, results, fields) => {
        if(results.length > 0){
            req.session['user_pay_status'] = results[0]['user_pay_status'];
        }
    });
    // TO FIX: Labelled as error but it's not one !!!
    res.render('errors/payment_redirection.html.twig');
}

module.exports = { UserSuccessCotizPayment };
