import { User } from 'src/models/user.model';
import { Database, RadiusDatabase } from 'src/utils/database';
import { Gadzflix } from 'src/utils/jellyfin';

export const synchroBDD = async (): Promise<void> => {
    const users = await Database.promisedQuery(
        'SELECT `user_name`, `user_is_gadz`, `user_pay_status`, `gadzflix_id` FROM `users`'
    ) as User[];

    users.forEach(async (user) => {
        await Promise.all([
            RadiusDatabase.promisedQuery(
                'UPDATE `radusergroup` SET `groupname`=? WHERE `username`=?',
                [
                    user.user_pay_status === 1 ? 'Enabled-Users' : 'Disabled-Users',
                    user.user_name
                ]
            ),
            Gadzflix.setIsDisabled(user.gadzflix_id, !(user.user_pay_status === 1 && user.user_is_gadz === 1))
        ])
            .then(response => console.log(response))
            .catch(error => console.log(`Error in executing ${error}`));
    })


};
