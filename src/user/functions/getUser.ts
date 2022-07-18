import { User } from 'src/models/user.model';
import { Database } from 'src/utils/database';

export const getUser = async (id: number): Promise<User> => {
  const user = (await Database.promisedQuery(
    'SELECT `user_id`, `user_name`, `user_firstname`, `user_lastname`, `user_email`, `user_phone`, `user_bucque`, `user_fams`, `user_campus`, `user_proms`, `user_rank`, `user_is_gadz`, `user_pay_status`, `user_notification` FROM users WHERE user_id=?',
    [id],
  )) as User[];

  if (user.length == 0) return null;
  return user[0];
};
