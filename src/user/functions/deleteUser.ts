import { HttpStatus } from '@nestjs/common';
import { deleteAccess } from 'src/access/functions/deleteAccess';
import { Database, RadiusDatabase } from 'src/utils/database';
import { Gadzflix } from 'src/utils/jellyfin';

export const deleteUser = async (id: number): Promise<HttpStatus> => {
  const [name, access] = await Promise.all([
    Database.promisedQuery(
      'SELECT user_name, gadzflix_id FROM users WHERE user_id=?',
      [id]),
    Database.promisedQuery(
      'SELECT `access_id` FROM `access` WHERE `access_user`=?',
      [id]),
  ]) as [{ user_name: string, gadzflix_id: string }[], { access_id: number }[]]

  if (name.length === 1) {
    let promise = [];

    access.forEach(async (access) => {
      promise.push(deleteAccess(access.access_id));
    });

    promise.push(
      Database.promisedQuery(
        'DELETE FROM users WHERE user_id=?',
        [id]
      ),
      RadiusDatabase.promisedQuery(
        'DELETE FROM `userinfo` WHERE username=?',
        [name[0].user_name]
      ),
      RadiusDatabase.promisedQuery(
        'DELETE FROM `radusergroup` WHERE `username`=?',
        [name[0].user_name]
      ),
      RadiusDatabase.promisedQuery(
        'DELETE FROM `radcheck` WHERE `username`= ?',
        [name[0].user_name]
      ),
      Gadzflix.removeUser(name[0].gadzflix_id)
    );

    await Promise.all(promise)
    return HttpStatus.OK;
  }

  return HttpStatus.BAD_REQUEST;
};
