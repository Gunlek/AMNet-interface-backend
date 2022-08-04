import { Database } from "src/utils/database";

export const getNumberOfHardware = async (): Promise<number> => {
    return (await Database.promisedQuery('SELECT `material_id` FROM `materials` WHERE `material_state`="pending"') as { material_id: number }[]).length;
}