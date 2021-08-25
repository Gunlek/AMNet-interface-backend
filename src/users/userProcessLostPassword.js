const { DatabaseSingleton } = require('../utils/databaseSingleton');
const nodemailer = require('nodemailer');
const fs = require('fs');
const replace = require('stream-replace');

require('dotenv').config();

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWD
    }
});

/*
 * Handle post request from lost-password form
 * Get email address from form, generate a unique token that corresponds
 * to the resetting request and send an email to this address using
 * the specified GMail account containing the address to the specific token
*/
const UserProcessLostPassword = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    let email = req.body.email;
    let token_value = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    database.query('SELECT * FROM users WHERE user_email = ?', [email], (error, results, fields) => {
        if(results.length > 0){
            let user_id = results[0]['user_id'];
            database.query('INSERT INTO reset_token(token_user, token_value) VALUES(?, ?)', [user_id, token_value]);

            let reset_link = "";
            if(process.env.DEBUG == "true")
                reset_link = "http://localhost:8080/users/change_password/"+token_value;
            else
                reset_link = "http://amnet.fr/users/change_password/"+token_value;
            var htmlstream = fs.createReadStream('src/users/templates/mail_template.html').pipe(replace("<LINK_HERE>", reset_link)).pipe(replace("<ID_HERE>", results[0]['user_name']));
            let mailOptions = {
                from: 'no-reply@amnet.fr',
                to: email,
                subject: 'Réinitialisation de mot de passe',
                html: htmlstream
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if(error)
                    console.log(error);
                else
                    htmlstream.close();
            });
            res.redirect('/users/login/');
        }
        else {
            res.redirect('/users/lost_password/?err=no_corresponding_account');
        }
    });
}

module.exports = { UserProcessLostPassword };
