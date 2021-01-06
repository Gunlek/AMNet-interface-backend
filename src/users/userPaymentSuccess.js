const { DatabaseSingleton } = require("../utils/databaseSingleton");

/**
 * Handle successful payment request
 */
const UserPaymentSuccess = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    const { ticket_id } = req.params;
    database.query('SELECT * FROM lydia_transactions WHERE request_ticket = ?', [ticket_id], (err, results) => {
        if(err)
            console.log(err);
        if(results.length > 0){
            const user_id = results[0]['request_payer_id'];
            database.query('DELETE FROM lydia_transactions WHERE request_ticket = ?', [ticket_id], (err) => {
                if(err)
                    console.log(err);
            });
            database.query('UPDATE users SET user_pay_status = 1 WHERE user_id = ?', [user_id], (err) => {
                if(err)
                    console.log(err);
                else
                    res.redirect('/');
            });
        }
    });
}

module.exports = { UserPaymentSuccess };
