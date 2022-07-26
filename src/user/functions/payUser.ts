import { HttpStatus } from '@nestjs/common';
import { Database, RadiusDatabase } from 'src/utils/database';
import { Gadzflix } from 'src/utils/jellyfin';

export const payUser = async (type: "all" | "several", users?: number[]): Promise<HttpStatus> => {
  if (type == "all") {
    let promise = [];

    const [user, mac_address] = await Promise.all([
      Database.promisedQuery(
        'SELECT user_is_gadz, gadzflix_id FROM users'),
      Database.promisedQuery(
        'SELECT access_mac FROM access')
    ]) as [{ gadzflix_id: string, user_is_gadz: boolean }[], { access_mac: string }[]]

    mac_address.forEach(async (access) => {
      promise.push(RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`="Enabled-Users" WHERE `username`=?',
        [access.access_mac]
      ));
    });

    user.forEach(async (user) => {
      await Gadzflix.setIsDisabled(user.gadzflix_id, !user.user_is_gadz);
    });

    promise.push(
      Database.promisedQuery(
        'UPDATE `users` SET `user_pay_status`= 1'
      ),
      RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`="Enabled-Users"'
      )
    );

    await Promise.all(promise);
    return HttpStatus.OK;
  }
  else if (type == "several") {
    let promise = [];
    let user_names = [] as string[];

    const [dbUsers, mac_address] = await Promise.all([
      Database.promisedQuery(
        'SELECT user_name, user_is_gadz,gadzflix_id FROM users WHERE user_id IN (?)', [users]),
      Database.promisedQuery(
        'SELECT access_mac FROM access WHERE access_user IN (?)', [users])
    ]) as [{ user_name: string, gadzflix_id: string, user_is_gadz: boolean }[], { access_mac: string }[]]

    mac_address.forEach(async (access) => {
      promise.push(RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`="Enabled-Users" WHERE `username`=?',
        [access.access_mac]
      ));
    });

    dbUsers.forEach(async (user) => {
      user_names.push(user.user_name);
    });

    dbUsers.forEach(async (user) => {
      await Gadzflix.setIsDisabled(user.gadzflix_id, !user.user_is_gadz);
    });

    promise.push(
      Database.promisedQuery(
        'UPDATE `users` SET `user_pay_status`=1 WHERE user_id IN (?)', [users]
      ),
      RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`="Enabled-Users" WHERE username IN (?)', [user_names]
      )
    );

    await Promise.all(promise);
    return HttpStatus.OK;
  }

  return HttpStatus.BAD_REQUEST;
};
