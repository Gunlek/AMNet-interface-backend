import { HttpStatus } from "@nestjs/common";
import { Database } from "src/utils/database";

export const deleteHardware = async (id: number, userId?: number): Promise<HttpStatus> => {
    const [material, user_rank] = await Promise.all([
        Database.promisedQuery(
            'SELECT material_user FROM `materials` WHERE material_id=?',
            [id]
        ),
        Database.promisedQuery(
            'SELECT `user_rank` FROM `users` WHERE `user_id`=?', [userId]
        )
    ]) as [{ material_user: number }[], { user_rank: string }[]]

    if (material.length === 1) {
        if (userId == material[0].material_user || user_rank[0].user_rank === 'admin') {
            await Database.promisedQuery('DELETE FROM `materials` WHERE material_id=?', [id]);

            return HttpStatus.OK;
        }
     
        return HttpStatus.UNAUTHORIZED
    }

    return HttpStatus.BAD_REQUEST;
}