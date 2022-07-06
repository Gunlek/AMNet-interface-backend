import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { User } from 'src/models/user.model';
import { Database, RadiusDatabase } from 'src/utils/database';
import { Gadzflix } from 'src/utils/jellyfin';

@Injectable()
export class UserService {
  private readonly users = [
    {
      userId: 1,
      username: 'Fabien',
      password: 'Aubret',
    },
  ];

  

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
}
