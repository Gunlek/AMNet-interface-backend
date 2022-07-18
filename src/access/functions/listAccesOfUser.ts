import { Access } from "src/models/access.model"
import { Database } from "src/utils/database"

export const listAccessOfUser = async (id: number): Promise<Access[]> => {
   return await Database.promisedQuery('SELECT * FROM `access` WHERE access_user=?', [id]) as Access[]
}