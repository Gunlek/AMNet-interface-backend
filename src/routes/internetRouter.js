const express = require('express');
const { InternetAddRequest } = require('../internet/internetAddRequest');
const { InternetDeleteRequest } = require('../internet/internetDeleteRequest');
const { InternetHome } = require('../internet/internetHome');


let internetRouter = express.Router();

internetRouter.get('/', InternetHome);
internetRouter.post('/add-request/', InternetAddRequest);
internetRouter.get('/delete/:user_id/:access_id/', InternetDeleteRequest);

module.exports = internetRouter;
