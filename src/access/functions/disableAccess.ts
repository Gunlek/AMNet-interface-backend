import { HttpStatus } from "@nestjs/common";
import { Database, RadiusDatabase } from "src/utils/database";

export const disableAccess = async (id: number): Promise<HttpStatus> => {
    const access = await Database.promisedQuery(
        'SELECT  `access_mac` FROM `access` WHERE access_id=?',
        [id]
    ) as { access_mac: string }[];

    if (access.length === 1) {
        await Promise.all([
            Database.promisedQuery(
                'UPDATE `access` SET `access_state`="declined" WHERE access_id=?',
                [id]
            ),
            RadiusDatabase.promisedQuery(
                'UPDATE `radusergroup` SET `groupname`="Disabled-Users" WHERE `username`=?',
                [access[0].access_mac]
            )
        ]);

        return HttpStatus.OK;
    }

    return HttpStatus.BAD_REQUEST;
}