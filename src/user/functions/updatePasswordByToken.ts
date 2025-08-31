import { Database, RadiusDatabase } from 'src/utils/database';
import * as bcrypt from 'bcrypt';
import { HttpStatus } from '@nestjs/common';
import { nthash } from 'smbhash';

export const updatePasswordByToken = async (
  token: string,
  password: { password1: string; password2: string }
): Promise<HttpStatus> => {
  try {
    const user_id = (await Database.promisedQuery(
      'SELECT token_user FROM reset_token WHERE token_value=?',
      [token],
    )) as { token_user: number }[];

    if (user_id.length === 1 && password.password1 === password.password2) {
      if (!process.env.SALT_ROUND) {
        console.error('Missing SALT_ROUND env var');
        return HttpStatus.INTERNAL_SERVER_ERROR;
      }

      const [hashed_password, user] = await Promise.all([
        bcrypt.hash(password.password1, Number(process.env.SALT_ROUND)),
        Database.promisedQuery(
            // Old: 'SELECT gadzflix_id, user_name FROM users WHERE user_id=?'
          'SELECT user_name FROM users WHERE user_id=?',
          [user_id[0].token_user]
        )
      ]);

      if (!user) {
        console.error('User not found for token:', token);
        return HttpStatus.BAD_REQUEST;
      }

      await Promise.all([
        Database.promisedQuery(
          'UPDATE `users` SET `user_password`=? WHERE user_id=?',
          [hashed_password, user_id[0].token_user]
        ),
        Database.promisedQuery(
          'DELETE FROM `reset_token` WHERE token_value=?',
          [token]
        ),
        RadiusDatabase.promisedQuery(
          'UPDATE `radcheck` SET `value`=? WHERE `username`=?',
          [nthash(password.password1), user[0].user_name]
        )
      ]);

      return HttpStatus.OK;
    }

    return HttpStatus.BAD_REQUEST;
  } catch (err) {
    console.error('updatePasswordByToken failed:', err);
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
};
