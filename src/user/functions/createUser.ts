import { User } from 'src/models/user.model';
import { Database, RadiusDatabase } from 'src/utils/database';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { HttpStatus } from '@nestjs/common';
import { md4 } from 'hash-wasm';

export const createUser = async (user: User): Promise<{ httpStatus: HttpStatus, error: any }> => {
  let httpStatus: HttpStatus;
  let error: { user_name: boolean; user_email: boolean; user_password?: boolean; user_phone?: boolean; };

  if (
    user.user_name !== '' &&
    user.user_email !== '' &&
    user.user_password !== '' &&
    user.user_phone !== ''
  ) {
    const [name, email] = await Promise.all([
      Database.promisedQuery(
        'SELECT user_id FROM users WHERE user_name=?',
        [user.user_name]
      ),
      Database.promisedQuery(
        'SELECT user_id FROM users WHERE user_email=?',
        [user.user_email])
    ]) as [{ user_id: string }[], { user_id: string }[]]

    if (name.length == 0 && email.length == 0) {
      const gadzflix_id = crypto.randomBytes(32).toString('hex');
      const hashed_paswword = await bcrypt.hash(
        user.user_password,
        Number(process.env.SALT_ROUND),
      )

      try{
        await Promise.all([
          Database.promisedQuery(
            'INSERT INTO `users`(`user_name`, `user_firstname`, `user_lastname`, `user_email`, `user_phone`, `user_password`, `user_bucque`, `user_fams`, `user_campus`, `user_proms`, `user_is_gadz`, `gadzflix_id`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
            [
              user.user_name,
              user.user_firstname,
              user.user_lastname,
              user.user_email,
              user.user_phone,
              hashed_paswword,
              user.user_bucque,
              user.user_fams,
              user.user_campus,
              user.user_proms,
              user.user_is_gadz,
              gadzflix_id
            ]
          ),
          RadiusDatabase.promisedQuery(
            'INSERT INTO `userinfo`(`username`, `firstname`, `lastname`, `email`, `creationby`, `creationdate`) VALUES (?, ?, ?, ?, ?, NOW())',
            [
              user.user_name,
              user.user_firstname,
              user.user_lastname,
              user.user_email,
              'API REST AMNet',
            ]
          ),
          RadiusDatabase.promisedQuery(
            'INSERT INTO `radusergroup`(`username`, `groupname`, `priority`) VALUES (?, ?, ?)',
            [user.user_name, 'Disabled-Users', 0]
          ),
          RadiusDatabase.promisedQuery(
            'INSERT INTO `radcheck`( `username`, `attribute`, `op`, `value`) VALUES (?, ?, ?, ?)',
            [user.user_name, 'NT-Password', ':=', md4(user.user_password)]
          )
        ]);
      }
      catch (err){
        return {httpStatus: HttpStatus.INTERNAL_SERVER_ERROR, error: err};
      }

      httpStatus = HttpStatus.OK;
      error = null;
    } else {
      httpStatus = HttpStatus.CONFLICT;
      error = { user_name: name.length !== 0, user_email: email.length !== 0 };
    }
  } else {
    httpStatus = HttpStatus.PARTIAL_CONTENT;
    error = {
      user_name: user.user_name === '',
      user_email: user.user_email === '',
      user_password: user.user_password === '',
      user_phone: user.user_phone === '',
    };
  }

  return { httpStatus: httpStatus, error: error }
};
