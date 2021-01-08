const { DatabaseSingleton } = require("../utils/databaseSingleton");

/*
 * Allows admin to list all tickets and managing them easily
*/
const TicketAdminTickets = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    
    req.session.returnTo = '/tickets/admin-tickets/';
    database.query('SELECT * FROM tickets WHERE ticket_state=1', (errors, closed_tickets, fields) => {
        database.query('SELECT * FROM tickets WHERE ticket_state=0', (errors, opened_tickets, fields) => {
            res.render('tickets/admin-tickets.html.twig', {data: req.session, opened_tickets: opened_tickets, closed_tickets: closed_tickets});
        });
    });
}

module.exports = { TicketAdminTickets }
