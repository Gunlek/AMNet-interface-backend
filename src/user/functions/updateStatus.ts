import { HttpStatus } from '@nestjs/common';
import { Database } from 'src/utils/database';
import { Gadzflix } from 'src/utils/jellyfin';

export const updateStatus = async (id: number): Promise<HttpStatus> => {
    const user = await Database.promisedQuery(
        'SELECT user_name, user_is_gadz, gadzflix_id FROM users WHERE user_id=?',
        [id],
    ) as { user_name: string, user_is_gadz: number, gadzflix_id: string }[];

    if (user.length === 1) {
        await Promise.all([
            Database.promisedQuery(
                'UPDATE `users` SET `user_is_gadz`=? WHERE user_id=?',
                [!user[0].user_is_gadz, id]
            ),
            Gadzflix.setIsDisabled(user[0].gadzflix_id, !user[0].user_is_gadz)
        ]);

        return HttpStatus.OK;
    }

    return HttpStatus.NOT_FOUND;
};
