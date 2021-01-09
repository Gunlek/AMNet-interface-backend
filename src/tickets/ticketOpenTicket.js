/*
 * Displays a form, enabling logged-in user to open a ticket
*/
const TicketOpenTicket = (req, res) => {
    res.render('tickets/open-ticket.html.twig', {data: req.session});
}

module.exports = { TicketOpenTicket };
