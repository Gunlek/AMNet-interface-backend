import { User } from 'src/models/user.model';
import { Database, RadiusDatabase } from 'src/utils/database';
import * as bcrypt from 'bcrypt';
import { nthash } from 'smbhash';
import { HttpStatus } from '@nestjs/common';

export const updateUser = async (user: User, id: number) => {
  const hashed_paswword = await bcrypt.hash(
    user.user_password,
    Number(process.env.SALT_ROUND),
  );
  const name = (await Database.promisedQuery(
    'SELECT user_name FROM users WHERE user_id=?',
    [id],
  )) as { user_name: string }[];

  await Database.promisedQuery(
    'UPDATE `users` SET `user_name`=?,`user_firstname`=?,`user_lastname`=?,`user_email`=?,`user_phone`=?,`user_password`=?,`user_bucque`=?,`user_fams`=?,`user_campus`=?,`user_proms`=?,`user_is_gadz`=? WHERE `user_id`=?',
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
      id,
    ],
  );

  await RadiusDatabase.promisedQuery(
    'UPDATE `userinfo` SET `username`= ?, `firstname`= ?, `lastname`= ?, `email`= ? WHERE username=?',
    [
      user.user_name,
      user.user_firstname,
      user.user_lastname,
      user.user_email,
      name[0].user_name,
    ],
  );

  await RadiusDatabase.promisedQuery(
    'UPDATE `radusergroup` SET `username`=? WHERE `username`=?',
    [user.user_name, name[0].user_name],
  );

  await RadiusDatabase.promisedQuery(
    'UPDATE `radcheck` SET  `username`= ?, `value`= ? WHERE  `username`= ?',
    [user.user_name, nthash(user.user_password), name[0].user_name],
  );

  return HttpStatus.OK;
};
