import { HttpStatus } from "@nestjs/common";
import { Database, RadiusDatabase } from "src/utils/database";
import { MacAdressVerification } from "src/utils/mac.verification";

export const updateMac = async (id: number, new_mac: string): Promise<HttpStatus> => {
    const old_access = (await Database.promisedQuery(
        'SELECT access_mac FROM access WHERE access_id=?',
        [id])
    ) as { access_mac: string }[];
    const mac_adrress = MacAdressVerification(new_mac);
    
    if (old_access.length === 1 && mac_adrress !== "") {
        await Promise.all([
            Database.promisedQuery('UPDATE `access` SET `access_mac`=? WHERE access_id=?', [mac_adrress, id]),
            RadiusDatabase.promisedQuery(
                'UPDATE `radusergroup` SET `username`=? WHERE `username`=?',
                [mac_adrress, old_access[0].access_mac]
            ),
            RadiusDatabase.promisedQuery(
                'UPDATE `radcheck` SET `username`=? WHERE `username`=?',
                [mac_adrress, old_access[0].access_mac]
            )
        ])
        return HttpStatus.OK;
    }

    return HttpStatus.BAD_REQUEST;
}