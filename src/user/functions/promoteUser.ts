import { HttpStatus } from '@nestjs/common';
import { Database, RadiusDatabase } from 'src/utils/database';

export const promoteUser = async (id: number): Promise<HttpStatus> => {
  const name = await Database.promisedQuery(
    'SELECT user_name FROM `users` WHERE user_id=?',
    [id],
  ) as { user_name: string }[];

  if (name.length === 1) {
    await Promise.all([
      Database.promisedQuery(
        'UPDATE users SET user_rank="admin" WHERE user_id=?',
        [id],
      ),
      RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`=? WHERE `username`=?',
        ['Admins', name[0].user_name]
      )
    ])

    return HttpStatus.OK;
  }
  else return HttpStatus.BAD_REQUEST;
};
