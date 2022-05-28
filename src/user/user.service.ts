import { Injectable } from '@nestjs/common';

export type User = any;

@Injectable()
export class UserService {
  private readonly users = [
    {
      userId: 1,
      username: 'Fabien',
      password: 'Aubret',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    // TODO: Customize to fetch user from database
    return this.users.find((user) => user.username === username);
  }
}
