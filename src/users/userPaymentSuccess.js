const { DatabaseSingleton } = require("../utils/databaseSingleton");
const { EnableRadiusConnection } = require('../utils/radius/enableRadiusConnection');

/**
 * Handle successful payment request
 */
const UserPaymentSuccess = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    const { ticket_id } = req.params;
    database.query('SELECT * FROM lydia_transactions WHERE request_ticket = ?', [ticket_id], (err, results) => {
        if(err) {
            console.log(err);
            res.sendStatus(400);
        }
        if(results.length > 0){
            const user_id = results[0]['request_payer_id'];
            database.query('DELETE FROM lydia_transactions WHERE request_ticket = ?', [ticket_id], (err) => {
                if(err) {
                    console.log(err);
                    res.sendStatus(400);
                }
            });
            database.query('UPDATE users SET user_pay_status = 1 WHERE user_id = ?', [user_id], (err) => {
                if(err) {
                    console.log(err);
                    res.sendStatus(400);
                }
                else {
                    database.query('SELECT * FROM users WHERE user_id = ?', [user_id], (err, storedUserResults) => {
                        console.error(user_id);
                        console.log(storedUserResults);
                        if(storedUserResults.length > 0){
                            const user = storedUserResults[0];
                            if(process.env.RADIUS == "true"){
                                EnableRadiusConnection(user['user_name']);
                            }
                            res.sendStatus(200);    // Everything is ok
                        }
                        else {
                            console.error("No result found for the specified user_id: " + user_id);
                            res.sendStatus(400);
                        }
                    });
                }
            });
        }
        else {
            console.error("No result found for the specified ticket_id: " + ticket_id);
            res.sendStatus(400);
        }
    });
}

module.exports = { UserPaymentSuccess };
