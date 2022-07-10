import { HttpStatus } from '@nestjs/common';
import { Database, RadiusDatabase } from 'src/utils/database';

export const unpayUser = async (id: number): Promise<HttpStatus> => {
  const name = (
    await Database.promisedQuery(
      'SELECT user_name FROM users WHERE user_id=?',
      [id],
    )
  )[0].user_name as string;

  if (name.length !== 0) {
    const mac_address = (await Database.promisedQuery(
      'SELECT access_mac FROM access WHERE access_user=?',
      [id],
    )) as { acess_mac: string }[];

    await Database.promisedQuery(
      'UPDATE `users` SET `user_pay_status`= 0 WHERE  user_id=?',
      [id],
    );
    await RadiusDatabase.promisedQuery(
      'UPDATE `radusergroup` SET `groupname`="Disabled-Users" WHERE `username`=?',
      [name],
    );

    mac_address.forEach(async (access) => {
      await RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`="Disabled-Users" WHERE `username`=?',
        [access],
      );
    });

    return HttpStatus.OK;
    // return 'User disabled';
  } else {
    return HttpStatus.NOT_FOUND;
    // return 'No user exist with this id';
  }
};
