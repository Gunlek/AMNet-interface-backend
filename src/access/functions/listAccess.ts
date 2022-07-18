import { Access } from "src/models/access.model"
import { Database } from "src/utils/database"

export const listAccess = async (): Promise<Access[]> => {
    return await Database.promisedQuery('SELECT *, (SELECT `user_name` FROM `users` WHERE `user_id`=`access_user`) AS `user_name`, (SELECT `user_pay_status` FROM `users` WHERE `user_id`=`access_user`) AS `user_pay_status` FROM `access`  ') as Access[]
}