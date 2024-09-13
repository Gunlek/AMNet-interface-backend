import { HttpStatus } from '@nestjs/common';
import { Database } from 'src/utils/database';
import { Gadzflix } from 'src/utils/jellyfin';

export const updateStatus = async (type: "all" | "several", users?: number[]): Promise<HttpStatus> => {
    if (type == "all") {
        const user = await Database.promisedQuery(
            'SELECT user_is_gadz, `user_pay_status`, gadzflix_id FROM users'
        ) as { user_is_gadz: boolean, gadzflix_id: string, user_pay_status: boolean }[]

        await Database.promisedQuery('UPDATE `users` SET `user_is_gadz`=NOT `user_is_gadz`');
        return HttpStatus.OK;
    }
    else if (type == "several") {
        const dbUsers = await Database.promisedQuery(
            'SELECT user_is_gadz, gadzflix_id, `user_pay_status` FROM users WHERE user_id IN (?)', [users]
        ) as { user_is_gadz: boolean, gadzflix_id: string, user_pay_status: boolean }[];

        await Database.promisedQuery('UPDATE `users` SET `user_is_gadz`=NOT `user_is_gadz` WHERE user_id IN (?)', [users]);
        return HttpStatus.OK;
    }

    return HttpStatus.NOT_FOUND;
};
