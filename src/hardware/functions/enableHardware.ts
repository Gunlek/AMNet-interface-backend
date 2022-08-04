import { HttpStatus } from "@nestjs/common";
import { Database } from "src/utils/database";

export const enableHardware = async (id: number): Promise<HttpStatus> => {
    const material = await Database.promisedQuery(
        'SELECT `material_description` FROM `materials` WHERE material_id=?',
        [id]
    ) as { material_description: string }[];

    if (material.length === 1) {
        await Database.promisedQuery(
            'UPDATE `materials` SET `material_state`="active" WHERE material_id=?',
            [id]
        )

        return HttpStatus.OK
    }
    else return HttpStatus.BAD_REQUEST
}