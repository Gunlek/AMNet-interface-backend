const express = require('express');
const { MaterialHome } = require('../material/materialHome');
const { MaterialAddRequest } = require('../material/materialAddRequest');
const { isUserLoggedIn } = require('../utils/isUserLoggedIn');
const { isCotizPaid } = require('../utils/isCotizPaid');

let materialRouter = express.Router();

// Ensure user is logged in
materialRouter.use(isUserLoggedIn);
materialRouter.post('/add-request/', MaterialAddRequest);

// Ensure user has paid his cotiz
materialRouter.use(isCotizPaid);
materialRouter.get('/', MaterialHome);

module.exports = materialRouter;
