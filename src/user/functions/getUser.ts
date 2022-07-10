import { User } from 'src/models/user.model';
import { Database } from 'src/utils/database';

export const getUser = async (id: number): Promise<User> => {
  const user = (await Database.promisedQuery(
    'SELECT * FROM users WHERE user_id=?',
    [id],
  )) as User[];

  if (user.length == 0) return null;
  return user[0];
};
