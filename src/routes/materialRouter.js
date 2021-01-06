const express = require('express');
const { MaterialHome } = require('../material/materialHome');
const { MaterialAddRequest } = require('../material/materialAddRequest');

let materialRouter = express.Router();

materialRouter.get('/', MaterialHome);
materialRouter.post('/add-request/', MaterialAddRequest)

module.exports = materialRouter;
