import { User } from 'src/models/user.model';
import { Database, RadiusDatabase } from 'src/utils/database';
import * as bcrypt from 'bcrypt';
import { HttpStatus } from '@nestjs/common';
import { nthash } from 'smbhash';

export const createUser = async (user: User): Promise<HttpStatus> => {
  if (
    user.user_name !== '' &&
    user.user_email !== '' &&
    user.user_password !== '' &&
    user.user_phone !== ''
  ) {
    const name = (await Database.promisedQuery(
      'SELECT user_id FROM users WHERE user_name=?',
      [user.user_name],
    )) as { user_id: string }[];

    const email = (await Database.promisedQuery(
      'SELECT user_id FROM users WHERE user_email=?',
      [user.user_email],
    )) as { user_id: string }[];

    if (name.length == 0 && email.length == 0) {
      const hashed_paswword = await bcrypt.hash(
        user.user_password,
        Number(process.env.SALT_ROUND),
      );

      await Database.promisedQuery(
        'INSERT INTO `users`(`user_name`, `user_firstname`, `user_lastname`, `user_email`, `user_phone`, `user_password`, `user_bucque`, `user_fams`, `user_campus`, `user_proms`, `user_rank`, `user_is_gadz`, `user_pay_status`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
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
          'user',
          user.user_is_gadz,
          0,
        ],
      );

      await RadiusDatabase.promisedQuery(
        'INSERT INTO `userinfo`(`username`, `firstname`, `lastname`, `email`, `creationby`, `creationdate`) VALUES (?, ?, ?, ?, ?, NOW())',
        [
          user.user_name,
          user.user_firstname,
          user.user_lastname,
          user.user_email,
          'API REST AMNet',
        ],
      );

      await RadiusDatabase.promisedQuery(
        'INSERT INTO `radusergroup`(`username`, `groupname`, `priority`) VALUES (?, ?, ?)',
        [user.user_name, 'Disabled-Users', 0],
      );

      await RadiusDatabase.promisedQuery(
        'INSERT INTO `radcheck`( `username`, `attribute`, `op`, `value`) VALUES (?, ?, ?, ?)',
        [user.user_name, 'NT-Password', ':=', nthash(user.user_password)],
      );

      return HttpStatus.OK;
    } else {
      return HttpStatus.CONFLICT;
      //   return { user_name: name.length == 0, user_email: email.length == 0 };
    }
  } else {
    return HttpStatus.PARTIAL_CONTENT;
    // return {
    //   user_name: user.user_name === '',
    //   user_email: user.user_email === '',
    //   user_password: user.user_password === '',
    //   user_phone: user.user_phone === '',
    // };
  }
};
