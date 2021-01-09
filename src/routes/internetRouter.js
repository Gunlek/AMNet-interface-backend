const express = require('express');
const { InternetAddRequest } = require('../internet/internetAddRequest');
const { InternetDeleteRequest } = require('../internet/internetDeleteRequest');
const { InternetHome } = require('../internet/internetHome');
const { isCotizPaid } = require('../utils/isCotizPaid');
const { isUserLoggedIn } = require('../utils/isUserLoggedIn');


let internetRouter = express.Router();

// Ensure user is logged in
internetRouter.use(isUserLoggedIn);
internetRouter.post('/add-request/', InternetAddRequest);
internetRouter.get('/delete/:user_id/:access_id/', InternetDeleteRequest);

// Ensure user is logged in and has paid his cotiz
internetRouter.use(isCotizPaid);
internetRouter.get('/', InternetHome);

module.exports = internetRouter;
