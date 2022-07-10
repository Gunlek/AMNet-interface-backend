import { HttpStatus, Injectable } from '@nestjs/common';
import { createUser } from './functions/createUser';
import { deleteUser } from './functions/deleteUser';
import { demoteUser } from './functions/demoteUser';
import { getUser } from './functions/getUser';
import { listUser } from './functions/listUser';
import { promoteUser } from './functions/promoteUser';
import { unpayUser } from './functions/unpayUser';
import { updateUser } from './functions/updateUser';

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
}
