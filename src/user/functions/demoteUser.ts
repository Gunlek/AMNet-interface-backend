import { HttpStatus } from '@nestjs/common';
import { Database } from 'src/utils/database';

export const demoteUser = async (id: number): Promise<HttpStatus> => {
  await Database.promisedQuery(
    'UPDATE users SET user_rank="user" WHERE user_id=?',
    [id],
  );
  return HttpStatus.OK;
};
