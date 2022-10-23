import { Database, RadiusDatabase } from 'src/utils/database';
import * as bcrypt from 'bcrypt';
import { HttpStatus } from '@nestjs/common';
import { nthash } from 'smbhash';
import { Gadzflix } from 'src/utils/jellyfin';

export const updatePasswordByToken = async (token: string, password: { password1: string; password2: string }): Promise<HttpStatus> => {
    const user_id = (await Database.promisedQuery(
        'SELECT token_user FROM reset_token WHERE token_value=?',
        [token],
    )) as { token_user: number }[];

    if (user_id.length === 1 && password.password1 === password.password2) {
        const [hashed_paswword, user] = await Promise.all([
            bcrypt.hash(
                password.password1,
                Number(process.env.SALT_ROUND),
            ),
            Database.promisedQuery(
                'SELECT gadzflix_id, user_name FROM users WHERE user_id=?',
                [user_id[0].token_user]
            )
        ]);
        
        await Promise.all([
            Database.promisedQuery(
                'UPDATE `users` SET `user_password`=? WHERE user_id=?',
                [hashed_paswword, user_id[0].token_user]),
            Database.promisedQuery(
                'DELETE FROM `reset_token` WHERE token_value=?',
                [token]
            ),
            RadiusDatabase.promisedQuery(
                'UPDATE `radcheck` SET  `value`= ? WHERE  `username`= ?',
                [nthash(password.password1), user[0].user_name]
            ),
            Gadzflix.changePassword(user[0].gadzflix_id, password.password1)
        ])

        return HttpStatus.OK
    }

    return HttpStatus.BAD_REQUEST
};