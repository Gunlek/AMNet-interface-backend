import { Database } from 'src/utils/database';
import * as bcrypt from 'bcrypt';
import { HttpStatus } from '@nestjs/common';

export const updatePasswordByToken = async (token: string, user: { password1: string; password2: string }): Promise<HttpStatus> => {
    const user_id = (await Database.promisedQuery(
        'SELECT token_user FROM reset_token WHERE token_value=?',
        [token],
    )) as { token_user: string }[];

    if (user_id.length === 1) {
        if (user.password1 === user.password2) {
            const hashed_paswword = await bcrypt.hash(
                user.password1,
                Number(process.env.SALT_ROUND),
            );

            await Promise.all([
                Database.promisedQuery(
                    'UPDATE `users` SET `user_password`=? WHERE user_id=?',
                    [hashed_paswword, user_id[0].token_user]),
                Database.promisedQuery(
                    'DELETE FROM `reset_token` WHERE token_value=?',
                    [token],
                )
            ])
            
            return HttpStatus.OK
        } else return HttpStatus.CONFLICT
    } else return HttpStatus.NO_CONTENT
};