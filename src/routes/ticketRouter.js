const express = require('express');
const { TicketAddTicket } = require('../tickets/ticketAddTicket');
const { TicketAdminTickets } = require('../tickets/ticketAdminTickets');
const { TicketCloseTicket } = require('../tickets/ticketCloseTicket');
const { TicketOpenTicket } = require('../tickets/ticketOpenTicket');
const { TicketSendResponse } = require('../tickets/ticketSendResponse');
const { TicketTrackTicket } = require('../tickets/ticketTrackTicket');
const { TicketViewTicket } = require('../tickets/ticketViewTicket');

let ticketRouter = express.Router();

ticketRouter.post('/add-ticket/', TicketAddTicket);
ticketRouter.post('/admin-tickets/', TicketAdminTickets);
ticketRouter.get('/close-ticket/:ticket_id', TicketCloseTicket);
ticketRouter.get('/open-ticket/', TicketOpenTicket);
ticketRouter.post('/send-response/', TicketSendResponse);
ticketRouter.get('/track-tickets/', TicketTrackTicket);
ticketRouter.get('/view-ticket/', TicketViewTicket);

module.exports = ticketRouter;
