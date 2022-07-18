import { User } from 'src/models/user.model';
import { Database, RadiusDatabase } from 'src/utils/database';
import * as bcrypt from 'bcrypt';
import { nthash } from 'smbhash';
import { HttpStatus } from '@nestjs/common';
import { Gadzflix } from 'src/utils/jellyfin';

export const updateUser = async (user: User, id: number) => {
  const name = (await Database.promisedQuery(
    'SELECT user_name FROM users WHERE user_id=?',
    [id],
  )) as { user_name: string }[];

  if (name.length === 1) {
    if (user.user_password !== '') {
      const [hashed_paswword, gadzflix_id] = await Promise.all([
        bcrypt.hash(
          user.user_password,
          Number(process.env.SALT_ROUND),
        ),
        Database.promisedQuery(
          'SELECT gadzflix_id FROM users WHERE user_id=?',
          [id]
        )
      ]);

      await Promise.all([
        Database.promisedQuery(
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
        ),
        RadiusDatabase.promisedQuery(
          'UPDATE `userinfo` SET `username`= ?, `firstname`= ?, `lastname`= ?, `email`= ? WHERE username=?',
          [
            user.user_name,
            user.user_firstname,
            user.user_lastname,
            user.user_email,
            name[0].user_name,
          ],
        ),
        RadiusDatabase.promisedQuery(
          'UPDATE `radusergroup` SET `username`=? WHERE `username`=?',
          [user.user_name, name[0].user_name],
        ),
        RadiusDatabase.promisedQuery(
          'UPDATE `radcheck` SET  `username`= ?, `value`= ? WHERE  `username`= ?',
          [user.user_name, nthash(user.user_password), name[0].user_name],
        ),
        Gadzflix.changePassword(gadzflix_id[0].gadzflix_id, user.user_password)
      ])
    }
    else {
      await Promise.all([
        Database.promisedQuery(
          'UPDATE `users` SET `user_name`=?,`user_firstname`=?,`user_lastname`=?,`user_email`=?,`user_phone`=?,`user_bucque`=?,`user_fams`=?,`user_campus`=?,`user_proms`=?,`user_is_gadz`=? WHERE `user_id`=?',
          [
            user.user_name,
            user.user_firstname,
            user.user_lastname,
            user.user_email,
            user.user_phone,
            user.user_bucque,
            user.user_fams,
            user.user_campus,
            user.user_proms,
            user.user_is_gadz,
            id,
          ],
        ),
        RadiusDatabase.promisedQuery(
          'UPDATE `userinfo` SET `username`= ?, `firstname`= ?, `lastname`= ?, `email`= ? WHERE username=?',
          [
            user.user_name,
            user.user_firstname,
            user.user_lastname,
            user.user_email,
            name[0].user_name,
          ],
        ),
        RadiusDatabase.promisedQuery(
          'UPDATE `radusergroup` SET `username`=? WHERE `username`=?',
          [user.user_name, name[0].user_name],
        ),
        RadiusDatabase.promisedQuery(
          'UPDATE `radcheck` SET  `username`= ? WHERE  `username`= ?',
          [user.user_name, name[0].user_name],
        )
      ])
    }

    return HttpStatus.OK;
  }

  return HttpStatus.NOT_FOUND;
};
