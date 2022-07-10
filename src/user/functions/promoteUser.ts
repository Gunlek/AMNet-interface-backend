import { HttpStatus } from '@nestjs/common';
import { Database } from 'src/utils/database';

export const promoteUser = async (id: number): Promise<HttpStatus> => {
  await Database.promisedQuery(
    'UPDATE users SET user_rank="admin" WHERE user_id=?',
    [id],
  );
  return HttpStatus.OK;
};
