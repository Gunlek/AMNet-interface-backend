const { DatabaseSingleton } = require("../utils/databaseSingleton");
const {sendMail } = require('../utils/sendMail');

require('dotenv').config();

const localSendMail = (users, mailContent) => {
    let destinations = [];
    users.map((user) => destinations.push(user['user_email']));
    
    if(destinations.length > 0){
        const mailDestinationStr = destinations.toString().replaceAll(",", ";");
        sendMail(
            process.env.CONTACT_MAIL_USER,
            process.env.CONTACT_MAIL_PASSWD,
            "Mail aux adhérents AMNet",
            mailContent,
            mailDestinationStr,
            "contact@amnet.fr"
        );
    }
}

const AdminSendGlobalMail = (req, res) => {
    const mailDestination = req.body.globalMailDestination;
    const mailContent = req.body.mailContent;
    let database = DatabaseSingleton.getInstance().getDatabase();

    switch(mailDestination){
        case "all":
            database.query('SELECT * FROM users', (error, users) => {
                localSendMail(users, mailContent);
            });
            break;
        
        case "cotiz-only":
            database.query('SELECT * FROM users WHERE user_pay_status=1', (error, users) => {
                localSendMail(users, mailContent);
            });
            break;

        case "no-cotiz-only":
            database.query('SELECT * FROM users WHERE user_pay_status=0', (error, users) => {
                localSendMail(users, mailContent);
            });
            break;

        case "gadz-only":
            database.query('SELECT * FROM users WHERE user_is_gadz=1', (error, users) => {
                localSendMail(users, mailContent);
            });
            break;

        case "no-gadz-only":
            database.query('SELECT * FROM users WHERE user_is_gadz=0', (error, users) => {
                localSendMail(users, mailContent);
            });
            break;
    }

    res.redirect('/admin');
}

module.exports = { AdminSendGlobalMail };
