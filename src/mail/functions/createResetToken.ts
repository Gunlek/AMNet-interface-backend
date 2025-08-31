import { HttpStatus } from "@nestjs/common";
import { Database } from "src/utils/database";
import * as crypto from 'crypto';
import { Transporter } from "src/utils/mail";
import * as replace from 'stream-replace';
import * as fs from 'fs';

export const createResetToken = async (email: string): Promise<HttpStatus> => {
    try {
    const user = (await Database.promisedQuery(
      'SELECT user_id, user_name FROM users WHERE user_email=?', [email]
    )) as { user_id: string, user_name: string }[];

    if (user.length === 1) {
      const token_value = crypto.randomBytes(64).toString('hex');
      await Database.promisedQuery(
        'INSERT INTO `reset_token`(`token_user`, `token_value`) VALUES (?, ?)',
        [user[0].user_id, token_value]
      );

      const reset_link = process.env.HOSTNAME + "/homepage/lostpassword/" + token_value;

      const { join } = await import('path');
      const templatePath = join(process.cwd(), 'src/mail/templates/password.html');

      const htmlstream = fs.createReadStream(templatePath)
        .pipe(replace(/<LINK_HERE>/g, reset_link))
        .pipe(replace("<ID_HERE>", user[0]['user_name']))
        .pipe(replace(/<HOSTNAME_HERE>/g, process.env.HOSTNAME ?? ''));

      htmlstream.on('error', (err) => {
        console.error('Stream error:', err);
      });

      await Transporter.sendMail('Mot de passe ou Identifiant oublié ?', htmlstream, [email]);
      return HttpStatus.OK;
    }

    return HttpStatus.NO_CONTENT;
  } catch (err) {
    console.error('createResetToken failed:', err);
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}