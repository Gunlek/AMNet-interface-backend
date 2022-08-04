import { Hardware } from "src/models/hardware.model"
import { Database } from "src/utils/database"

export const listHardwareOfUser = async (id: number): Promise<Hardware[]> => {
   return await Database.promisedQuery('SELECT * FROM `materials` WHERE material_user=?', [id]) as Hardware[];
}