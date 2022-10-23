const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

export class Transporter {
  static instance = null;

  static getInstance() {
    if (Transporter.instance == null) {
      const myOAuth2Client = new OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
      );
      myOAuth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
      });
      const myAccessToken = myOAuth2Client.getAccessToken();

      Transporter.instance = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        pool: true,
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_USER,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken: myAccessToken,
        },
      });
    } else {
      return Transporter.instance;
    }
  }

  static async sendMail(
    subject: string,
    content: any,
    destination: string[],
  ) {
    const mailOptions = {
      from: '"👩‍✈️ Team AMNet 🧑‍✈️" <no-reply@amnet.fr>',
      to: destination,
      subject: subject,
      html: content,
      replyTo: 'contact@amnet.fr',
    };

    await Transporter.instance.sendMail(
      mailOptions,
      (error: any, info: any) => {
        if (error) console.error(error);
      },
    );
  }
}
