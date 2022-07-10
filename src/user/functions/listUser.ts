import { User } from 'src/models/user.model';
import { Database } from 'src/utils/database';

export const listUser = async (): Promise<User[]> =>
  (await Database.promisedQuery('SELECT * FROM users')) as User[];
