/*
 * Displays a form, enabling logged-in user to open a ticket
*/
const TicketOpenTicket = (req, res) => {
    if(!req.session['logged_in']){
        req.session.returnTo = '/tickets/open-ticket/';
        res.redirect('/access/login/');
    }
    else {
        res.render('tickets/open-ticket.html.twig', {data: req.session});
    }
}

module.exports = { TicketOpenTicket };
