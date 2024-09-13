import { User } from 'src/models/user.model';
import { Database, RadiusDatabase } from 'src/utils/database';

export const synchroBDD = async (): Promise<void> => {
    const users = await Database.promisedQuery(
        'SELECT `user_name`, `user_is_gadz`, `user_pay_status`, `gadzflix_id`, `user_rank` FROM `users`'
    ) as User[];

    users.map(async (user) => {
        await Promise.all([
            RadiusDatabase.promisedQuery(
                'UPDATE `radusergroup` SET `groupname`=? WHERE `username`=?',
                [
                    user.user_pay_status === 1 ? user.user_rank == "admin" ? 'Admins' : 'Enabled-Users' : 'Disabled-Users',
                    user.user_name
                ]
            ),
        ])
            .then(response => console.log(response))
            .catch(error => console.log(`Error in executing ${error}`));
    })
};
