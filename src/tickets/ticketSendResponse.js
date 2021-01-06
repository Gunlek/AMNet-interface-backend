const { DatabaseSingleton } = require("../utils/databaseSingleton");

/*
 * Handle response sending, register any new response to the ticket
 * on the SQL database
*/
const TicketSendResponse = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    let ticket_id = req.body.ticket_id;
    let message = req.body.msg_content;

    database.query('SELECT MAX(discuss_order) AS max_order FROM tickets_discuss WHERE discuss_ticket=?', [ticket_id], (errors, results, fields) => {
        if(results.length > 0){
            let next_order = results[0].max_order + 1;
            database.query('INSERT INTO tickets_discuss(discuss_ticket, discuss_user, discuss_message, discuss_order) VALUES(?, ?, ?, ?)', [ticket_id, req.session.user_id, message, next_order], () => {
                res.redirect('back');
            });
        }
        else
            res.redirect('/tickets/track-tickets/');
    });
}

module.exports = { TicketSendResponse };
