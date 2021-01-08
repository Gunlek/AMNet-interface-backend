const { DatabaseSingleton } = require('../utils/databaseSingleton');

/*
 * Allows user to list all active tickets for him
*/
const TicketTrackTicket = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    
    database.query('SELECT * FROM tickets WHERE ticket_user=? ORDER BY ticket_id DESC', [req.session.user_id], (errors, results, fields) => {
        res.render('tickets/track-tickets.html.twig', {data: req.session, tickets: results}); 
    });
}

module.exports = { TicketTrackTicket };
