import { HttpStatus, Injectable } from '@nestjs/common';
import { createUser } from './functions/createUser';
import { deleteUser } from './functions/deleteUser';
import { demoteUser } from './functions/demoteUser';
import { getUser } from './functions/getUser';
import { listUser } from './functions/listUser';
import { promoteUser } from './functions/promoteUser';
import { unpayUser } from './functions/unpayUser';
import { updateUser } from './functions/updateUser';
import { Cron } from '@nestjs/schedule';
import { User } from 'src/models/user.model';
import { Database, RadiusDatabase } from 'src/utils/database';
import { Gadzflix } from 'src/utils/jellyfin';
import { getNameByToken } from './functions/getNameByToken';
import { updatePasswordByToken } from './functions/updatePasswordByToken';
import { getNumberOfUsers } from './functions/getNumberOfUsers';

@Injectable()
export class UserService {
  updateUser(user: User, id: number): Promise<HttpStatus> {
    return updateUser(user, id);
  }

  createUser(user: User): Promise<{ httpStatus: HttpStatus, error: any }> {
    return createUser(user);
  }

  promoteUser(id: number): Promise<HttpStatus> {
    return promoteUser(id);
  }

  demoteUser(id: number): Promise<HttpStatus> {
    return demoteUser(id);
  }

  deleteUser(id: number): Promise<HttpStatus> {
    return deleteUser(id);
  }

  unpayUser(id: number): Promise<HttpStatus> {
    return unpayUser(id);
  }

  listUser(): Promise<User[]> {
    return listUser();
  }

  getUser(id: number): Promise<User> {
    return getUser(id);
  }

  getNameByToken(token: string): Promise<string> {
    return getNameByToken(token);
  }

  updatePasswordByToken(token: string, user: { password1: string; password2: string }): Promise<HttpStatus> {
    return updatePasswordByToken(token, user);
  }

  getNumberOfUsers(): Promise<number[]> {
    return getNumberOfUsers();
  }

  @Cron('47 3 * * *')
  async handleCron() {
    const users = await Database.promisedQuery(
      'SELECT `user_name`, `user_is_gadz`, `user_pay_status`, `gadzflix_id` FROM `users`'
    ) as User[];
    let promise = [];

    users.forEach(async (user) => {
      promise.push(RadiusDatabase.promisedQuery(
        'UPDATE `radusergroup` SET `groupname`=? WHERE `username`=?',
        [
          user.user_pay_status === 1 ? 'Enabled-Users' : 'Disabled-Users',
          user.user_name
        ]
      ),
        Gadzflix.setIsDisabled(user.gadzflix_id, !(user.user_pay_status === 1 && user.user_is_gadz === 1))
      )
    })

    await Promise.all(promise);
    console.log("test synchro gadz")
  }
}
