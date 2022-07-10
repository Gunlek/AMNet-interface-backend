import { HttpStatus } from '@nestjs/common';
import { Database, RadiusDatabase } from 'src/utils/database';

export const deleteUser = async (id: number): Promise<HttpStatus> => {
  const name = (
    await Database.promisedQuery(
      'SELECT user_name FROM users WHERE user_id=?',
      [id],
    )
  )[0].user_name as string;

  await Database.promisedQuery('DELETE FROM users WHERE user_id=?', [id]);
  await Database.promisedQuery('DELETE FROM access WHERE access_user=?', [id]);
  await RadiusDatabase.promisedQuery(
    'DELETE FROM `userinfo` WHERE username=?',
    [name],
  );
  await RadiusDatabase.promisedQuery(
    'DELETE FROM `radusergroup` WHERE `username`=?',
    [name],
  );
  await RadiusDatabase.promisedQuery(
    'DELETE FROM `radcheck` WHERE  `username`= ?',
    [name],
  );

  return HttpStatus.OK;
};
