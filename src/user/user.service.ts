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
import { Injectable } from '@nestjs/common';

export type User = any;

@Injectable()
export class UserService {
  updateUser(user: User, id: number): Promise<HttpStatus> {
    return updateUser(user, id);
  }

  createUser(user: User): Promise<HttpStatus> {
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

  @Cron('47 3 * * *')
  async handleCron() {
    const [users, gadzflix_users, radius_users] = await Promise.all([
      Database.promisedQuery('SELECT * FROM users'),
      Gadzflix.getUsers(),
      RadiusDatabase.promisedQuery('SELECT * FROM `radusergroup`')
    ]) as [User[], any, any]

    users.forEach((user) =>{
      if(user.user_pay_status === 1){
        Database.promisedQuery('UPDATE `radusergroup` SET `groupname`=? WHERE `username`=?', ['Enabled-Users', user.user_name])
        Gadzflix.setIsDisabled(user.jellyfin_id, false)
      }
      else{
        Database.promisedQuery('UPDATE `radusergroup` SET `groupname`=? WHERE `username`=?', ['Disabled-Users', user.user_name])
        Gadzflix.setIsDisabled(user.jellyfin_id, true)
      }
    })
}
