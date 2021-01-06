const { DatabaseSingleton } = require('../utils/databaseSingleton');

/**
 * Handle cancelled / expired payment request
 */
const UserCancelPayment = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    const { ticket_id } = req.params;
    database.query('DELETE FROM lydia_transactions WHERE request_ticket = ?', [ticket_id], (err) => {
        if(err)
            console.log(err);
    });
}

module.exports = { UserCancelPayment };
