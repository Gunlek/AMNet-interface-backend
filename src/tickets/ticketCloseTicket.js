const { DatabaseSingleton } = require('../utils/databaseSingleton');

/*
 * Allows logged-in user to close a ticket
 * FIXME: Any user can close a random ticket...
*/
const TicketCloseTicket = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    if(!req.session['logged_in']){
        req.session.returnTo = '/tickets/open-ticket/';
        res.redirect('/access/login/');
    }
    else {
        database.query('UPDATE tickets SET ticket_state=1 WHERE ticket_id=?', [req.params.ticket_id], () => {
            res.redirect('/tickets/track-tickets/');
        })
    }
}

module.exports = { TicketCloseTicket };
