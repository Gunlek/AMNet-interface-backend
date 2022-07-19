import { HttpStatus } from '@nestjs/common';
import { Database, RadiusDatabase } from 'src/utils/database';
import { Gadzflix } from 'src/utils/jellyfin';

export const payUser = async (id: number): Promise<HttpStatus> => {
  const [user, mac_address] = await Promise.all([
    Database.promisedQuery(
      'SELECT user_name, gadzflix_id FROM users WHERE user_id=?',
      [id]
    ),
    Database.promisedQuery(
      'SELECT access_mac FROM access WHERE access_user=?',
      [id]
    )
  ]) as [{ user_name: string, gadzflix_id: string }[], { acess_mac: string }[]]

  if (user.length === 1) {
    let promise = [];

    mac_address.forEach(async (access) => {
      promise.push(RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`="Enabled-Users" WHERE `username`=?',
        [access]
      ));
    });

    promise.push(
      Database.promisedQuery(
        'UPDATE `users` SET `user_pay_status`= 1 WHERE user_id=?',
        [id]
      ),
      RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`="Enabled-Users" WHERE `username`=?',
        [user[0].user_name]
      ),
      Gadzflix.setIsDisabled(user[0].gadzflix_id, false)
    );

    await Promise.all(promise);

    return HttpStatus.OK;
  }

  return HttpStatus.NOT_FOUND;
};
