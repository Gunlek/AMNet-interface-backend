const express = require('express');
const { TicketAddTicket } = require('../tickets/ticketAddTicket');
const { TicketAdminTickets } = require('../tickets/ticketAdminTickets');
const { TicketCloseTicket } = require('../tickets/ticketCloseTicket');
const { TicketOpenTicket } = require('../tickets/ticketOpenTicket');
const { TicketSendResponse } = require('../tickets/ticketSendResponse');
const { TicketTrackTicket } = require('../tickets/ticketTrackTicket');
const { TicketViewTicket } = require('../tickets/ticketViewTicket');
const { isUserAdmin } = require('../utils/isUserAdmin');
const { isUserLoggedIn } = require('../utils/isUserLoggedIn');

let ticketRouter = express.Router();

// Ensure user is logged in
ticketRouter.use(isUserLoggedIn);
ticketRouter.post('/add-ticket/', TicketAddTicket);
ticketRouter.get('/close-ticket/:ticket_id', TicketCloseTicket);
ticketRouter.get('/open-ticket/', TicketOpenTicket);
ticketRouter.post('/send-response/', TicketSendResponse);
ticketRouter.get('/track-tickets/', TicketTrackTicket);
ticketRouter.get('/view-ticket/', TicketViewTicket);

ticketRouter.use(isUserAdmin);
ticketRouter.post('/admin-tickets/', TicketAdminTickets);

module.exports = ticketRouter;
