import { Database } from 'src/utils/database';

export const getNameByToken = async (token: string): Promise<string> => {
  const user_id = await Database.promisedQuery(
    'SELECT token_user FROM reset_token WHERE token_value=?',
    [token],
  ) as { token_user: string }[];

  if (user_id.length === 1) {
    const user_name = (await Database.promisedQuery(
      'SELECT user_name FROM users WHERE user_id=?',
      [user_id[0].token_user],
    )) as { user_name: string }[];

    return user_name[0].user_name;
  }
};