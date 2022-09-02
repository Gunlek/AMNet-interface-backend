import { HttpStatus } from "@nestjs/common";
import { Hardware } from "src/models/hardware.model";
import { Database } from "src/utils/database";

export const createHardware = async (
    material: Hardware,
    userId: number
): Promise<HttpStatus> => {
    if (
        material.material_description &&
        material.material_reason &&
        material.material_user &&
        userId
    ) {
        const user_rank = await Database.promisedQuery(
            'SELECT `user_rank` FROM `users` WHERE `user_id`=?', [userId]
        ) as { user_rank: string }[]

        if (userId == material.material_user || user_rank[0].user_rank === 'admin') {
            Database.promisedQuery(
                'INSERT INTO `materials`(`material_user`, `material_description`, `material_reason`,`material_state`) VALUES (?, ?, ?, ?)',
                [
                    material.material_user,
                    material.material_description,
                    material.material_reason,
                    "pending"
                ]
            )

            return HttpStatus.OK
        }

        return HttpStatus.UNAUTHORIZED
    }

    return HttpStatus.PARTIAL_CONTENT
}