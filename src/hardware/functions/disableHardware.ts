import { HttpStatus } from "@nestjs/common";
import { Database } from "src/utils/database";

export const disableHardware = async (id: number): Promise<HttpStatus> => {
    const material = await Database.promisedQuery(
        'SELECT `material_user` FROM `materials` WHERE material_id=?',
        [id]
    ) as { material_user: string }[];

    if (material.length === 1) {
        await Database.promisedQuery(
            'UPDATE `materials` SET `material_state`="declined" WHERE material_id=?',
            [id]
        );

        return HttpStatus.OK;
    }

    return HttpStatus.BAD_REQUEST;
}