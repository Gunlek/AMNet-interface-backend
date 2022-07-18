import { Database } from "src/utils/database";

export const getNumberOfAccess = async (): Promise<number> => {
    return (await Database.promisedQuery('SELECT `access_id` FROM `access` WHERE `access_state`="pending"') as { access_id: number }[]).length;
}