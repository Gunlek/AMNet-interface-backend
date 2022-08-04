
import { Hardware } from "src/models/hardware.model"
import { Database } from "src/utils/database"

export const listHardware = async (): Promise<Hardware[]> => {
    return await Database.promisedQuery('SELECT *, (SELECT `user_name` FROM `users` WHERE `user_id`=`material_user`) AS `user_name`, (SELECT `user_pay_status` FROM `users` WHERE `user_id`=`material_user`) AS `user_pay_status` FROM `materials`  ') as Hardware[];
}