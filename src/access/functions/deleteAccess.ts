import { HttpStatus } from "@nestjs/common";
import { unlink, existsSync } from "node:fs";
import { Database, RadiusDatabase } from "src/utils/database";

export const deleteAccess = async (id: number, userId?: number): Promise<HttpStatus> => {
    const [access, user_rank] = await Promise.all([
        Database.promisedQuery(
            'SELECT `access_proof`, `access_mac`, access_user FROM `access` WHERE access_id=?',
            [id]
        ),
        Database.promisedQuery(
            'SELECT  `user_rank` FROM `users` WHERE `user_id`=?', [userId]
        )
    ]) as [{ access_mac: string, access_proof: string, access_user: number }[], { user_rank: string }[]]

    if (access.length === 1) {
        if (!userId || userId === access[0].access_user || user_rank[0].user_rank === 'admin') {
            const path = `./src/access/proof/${access[0].access_proof}`
            
            if (access[0].access_proof !== "" && existsSync(path))
                unlink(path, (err) => { if (err) throw err; });

            await Promise.all([
                Database.promisedQuery('DELETE FROM `access` WHERE access_id=?', [id]),
                RadiusDatabase.promisedQuery('DELETE FROM `radcheck` WHERE `username`=?', [access[0].access_mac]),
                RadiusDatabase.promisedQuery('DELETE FROM `radusergroup` WHERE `username`=?', [access[0].access_mac]),
            ]);

            return HttpStatus.OK;
        }

        return HttpStatus.UNAUTHORIZED
    }

    return HttpStatus.BAD_REQUEST;
}