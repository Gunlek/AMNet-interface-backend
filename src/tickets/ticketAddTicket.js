const { DatabaseSingleton } = require('../utils/databaseSingleton');

/*
 * Handle "open ticket" form submitting and register the new ticket
 * in the database
*/
const TicketAddTicket = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    let subject = req.body.subject;
    let content = req.body.content;
    let user_id = req.body.user_id;

    database.query('INSERT INTO tickets(ticket_subject, ticket_user) VALUES(?, ?)', [subject, user_id], () => {
        database.query('SELECT MAX(ticket_id) AS max FROM tickets', (errors, results, fields) => {
            database.query('INSERT INTO tickets_discuss(discuss_ticket, discuss_user, discuss_message, discuss_order) VALUES(?, ?, ?, ?)', [results[0]['max'], user_id, content, 0], () => {
                res.redirect('/tickets/track-tickets/');
            });
        });
    });
}

module.exports = { TicketAddTicket }