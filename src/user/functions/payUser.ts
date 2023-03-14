import { HttpStatus } from '@nestjs/common';
import { Database, RadiusDatabase } from 'src/utils/database';
import { Gadzflix } from 'src/utils/jellyfin';

export const payUser = async (type: "all" | "several", users?: number[]): Promise<HttpStatus> => {
  if (type == "all") {
    let promise = [];

    const [user, admins, mac_address] = await Promise.all([
      Database.promisedQuery(
        'SELECT user_is_gadz, gadzflix_id FROM users'),
      Database.promisedQuery(
        'SELECT user_name FROM users WHERE user_rank="admin"'),
      Database.promisedQuery(
        'SELECT access_mac, (SELECT `user_rank` FROM `users` WHERE `user_id`=`access_user`) AS `user_rank` FROM access')
    ]) as [{ gadzflix_id: string, user_is_gadz: boolean }[], { user_name: string }[], { access_mac: string, user_rank: string }[]]

    mac_address.map(async (access) => {
      promise.push(RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`=? WHERE `username`=?',
        [access.user_rank == "admin" ? "Admins" : "Enabled-Users", access.access_mac]
      ));
    });

    user.map(async (user) => {
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
    admins.map(async (admin) => {
      await RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`="Admins" WHERE username=?', [admin.user_name]
      )
    })
    
    return HttpStatus.OK;
  }
  else if (type == "several") {
    let promise = [];
    let user_names = [] as string[];
    let admin_names = [] as string[];

    const [dbUsers, mac_address] = await Promise.all([
      Database.promisedQuery(
        'SELECT user_name, user_is_gadz,gadzflix_id, user_rank FROM users WHERE user_id IN (?)', [users]),
      Database.promisedQuery(
        'SELECT access_mac, (SELECT `user_rank` FROM `users` WHERE `user_id`=`access_user`) AS `user_rank` FROM access WHERE access_user IN (?)', [users])
    ]) as [{ user_name: string, gadzflix_id: string, user_is_gadz: boolean, user_rank: string }[], { access_mac: string, user_rank: string }[]]

    mac_address.map(async (access) => {
      promise.push(RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`=? WHERE `username`=?',
        [access.user_rank == "admin" ? "Admins" : "Enabled-Users", access.access_mac]
      ));
    });

    dbUsers.map(async (user) => {
      if (user.user_rank == "admin") admin_names.push(user.user_name);
      else user_names.push(user.user_name);
    });

    dbUsers.map(async (user) => {
      await Gadzflix.setIsDisabled(user.gadzflix_id, !user.user_is_gadz);
    });

    promise.push(
      Database.promisedQuery(
        'UPDATE `users` SET `user_pay_status`=1 WHERE user_id IN (?)', [users]
      ),
      RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`="Enabled-Users" WHERE username IN (?)', [user_names]
      ),
      RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`="Admins" WHERE username IN (?)', [admin_names]
      )
    );

    await Promise.all(promise);
    return HttpStatus.OK;
  }

  return HttpStatus.BAD_REQUEST;
};
