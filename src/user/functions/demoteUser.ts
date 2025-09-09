import { HttpStatus } from '@nestjs/common';
import { Database, RadiusDatabase } from 'src/utils/database';

export const demoteUser = async (id: number): Promise<HttpStatus> => {
  const name = await Database.promisedQuery(
    'SELECT `user_name`, `user_pay_status` FROM `users` WHERE user_id=?',
    [id],
  ) as { user_name: string, user_pay_status: boolean }[];

  if (name.length === 1) {
    await Promise.all([
      Database.promisedQuery(
        'UPDATE users SET user_rank="user" WHERE user_id=?',
        [id],
      ).catch(() => console.log('[Demote User] Failed to update user')),
      RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`=? WHERE `username`=?',
        [name[0].user_pay_status ? 'Enabled-Users' : 'Disabled-Users', name[0].user_name]
      ).catch(() => console.log('[Demote User] Failed to update radusergroup'))
    ])

    return HttpStatus.OK;
  }
  
  return HttpStatus.BAD_REQUEST;
};
