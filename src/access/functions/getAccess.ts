import { Access } from "src/models/access.model";
import { Database } from "src/utils/database";

export const getAccess = async (id: number): Promise<Access> => {
    const access = (await Database.promisedQuery(
        'SELECT * FROM access WHERE access_id=?',
        [id],
    )) as Access[];

    if (access.length == 1) return access[0];
}