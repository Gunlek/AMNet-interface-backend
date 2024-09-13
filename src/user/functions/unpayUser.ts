import { HttpStatus } from '@nestjs/common';
import { Database, RadiusDatabase } from 'src/utils/database';

export const unpayUser = async (type: "all" | "several", users?: number[]): Promise<HttpStatus> => {
  if (type == "all") {
    let promise = [];

    const [user, mac_address] = await Promise.all([
      Database.promisedQuery(
        'SELECT user_name, gadzflix_id FROM users'),
      Database.promisedQuery(
        'SELECT access_mac FROM access')
    ]) as [{ gadzflix_id: string }[], { access_mac: string }[]]

    mac_address.map(async (access) => {
      promise.push(RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`="Disabled-Users" WHERE `username`=?',
        [access.access_mac]
      ));
    });

    promise.push(
      Database.promisedQuery(
        'UPDATE `users` SET `user_pay_status`= 0'
      ),
      RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`="Disabled-Users"'
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
        'SELECT user_name, gadzflix_id FROM users WHERE user_id IN (?)', [users]),
      Database.promisedQuery(
        'SELECT access_mac FROM access WHERE access_user  IN (?)', [users])
    ]) as [{ user_name: string, gadzflix_id: string }[], { acess_mac: string }[]]

    mac_address.map(async (access) => {
      promise.push(RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`="Disabled-Users" WHERE `username`=?',
        [access.acess_mac]
      ));
    });

    dbUsers.map(async (user) => {
      user_names.push(user.user_name);
    });

    promise.push(
      Database.promisedQuery(
        'UPDATE `users` SET `user_pay_status`= 0 WHERE user_id IN (?)', [users]
      ),
      RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`="Disabled-Users" WHERE username IN (?)', [user_names]
      )
    );

    await Promise.all(promise);
    return HttpStatus.OK;
  }

  return HttpStatus.BAD_REQUEST;
};
