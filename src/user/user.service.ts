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
import { getNameByToken } from './functions/getNameByToken';
import { updatePasswordByToken } from './functions/updatePasswordByToken';
import { getNumberOfUsers } from './functions/getNumberOfUsers';
import { payUser } from './functions/payUser';
import { updateStatut } from './functions/updateStatut';
import { synchroBDD } from './functions/synchro';

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

  payUser(id: number): Promise<HttpStatus> {
    return payUser(id);
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

  updateStatut(id: number): Promise<HttpStatus> {
    return updateStatut(id);
  }

  @Cron('18 5 * * *')
  async handleCron() {
    synchroBDD()
  }
}
