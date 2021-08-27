const nodemailer = require('nodemailer');

const sendMail = (sender, password, object, content, destination, from=sender) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: sender,
            pass: password
        }
    });

    let mailOptions = {
        from: from,
        to: destination,
        subject: object,
        html: content,
        replyTo : from
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if(error)
            console.error(error);
        else
            htmlstream.close();
    });
}

module.exports = { sendMail };