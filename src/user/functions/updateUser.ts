import { User } from 'src/models/user.model';
import { Database, RadiusDatabase } from 'src/utils/database';
import * as bcrypt from 'bcrypt';
import { HttpStatus } from '@nestjs/common';
import { demoteUser } from './demoteUser';
import { payUser } from './payUser';
import { promoteUser } from './promoteUser';
import { unpayUser } from './unpayUser';
import { md4 } from 'hash-wasm';

export const updateUser = async (user: User, id: number, userId: number): Promise<HttpStatus> => {
  const [name, rank] = await Promise.all([
    Database.promisedQuery(
      'SELECT user_name FROM users WHERE user_id=?',
      [id]),
    Database.promisedQuery(
      'SELECT user_rank FROM users WHERE user_id=?',
      [userId])
  ]) as [{ user_name: string }[], { user_rank: string }[]];

  if (name.length === 1) {
    if (rank[0].user_rank === "admin") {
      user.user_pay_status ? payUser("several", [id]) : unpayUser("several", [id]);
      user.user_rank === "admin" ? promoteUser(id) : demoteUser(id);
    }

    if (user.user_password && user.user_password !== '') {
      const hashed_paswword = await bcrypt.hash(
        user.user_password,
        Number(process.env.SALT_ROUND),
      )

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
          [user.user_name, md4(user.user_password), name[0].user_name],
        ),
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
