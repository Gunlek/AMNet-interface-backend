import { Database } from "src/utils/database";

export const getNumberOfUsers = async (): Promise<number[]> => {
    return [
        ((await Database.promisedQuery(
            'SELECT `user_id` FROM `users` WHERE 1',
        )) as { user_id: number }[]).length,
        ((await Database.promisedQuery(
            'SELECT `user_id` FROM `users` WHERE `user_pay_status`=1',
        )) as { user_id: number }[]).length
    ]
};