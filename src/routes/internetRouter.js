const express = require('express');
const { InternetAddRequest } = require('../internet/internetAddRequest');
const { InternetDeleteRequest } = require('../internet/internetDeleteRequest');
const { InternetHome } = require('../internet/internetHome');
const { isCotizPaid } = require('../utils/isCotizPaid');
const { isUserLoggedIn } = require('../utils/isUserLoggedIn');

const multer = require("multer");
const fs = require('fs');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if(!fs.existsSync('statics/uploads/'))
            fs.mkdirSync('statics/uploads/', {recursive: true});
        cb(null, 'statics/uploads/')
    },

    filename: (req, file, cb) => {
        let lastExtension = file.originalname.split('.').length - 1;
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[lastExtension]);
    }
})
const upload = multer({
    storage: storage
});


let internetRouter = express.Router();

// Ensure user is logged in
internetRouter.use(isUserLoggedIn);
internetRouter.post('/add-request/', upload.single("photoProof"), InternetAddRequest);
internetRouter.get('/delete/:user_id/:access_id/', InternetDeleteRequest);

// Ensure user is logged in and has paid his cotiz
internetRouter.use(isCotizPaid);
internetRouter.get('/', InternetHome);

module.exports = internetRouter;
