import { HttpStatus } from "@nestjs/common";
import { Database, RadiusDatabase } from "src/utils/database";
import { optimizeImage } from "src/utils/file";
import { MacAdressVerification } from "src/utils/mac.verification";

export const createAccess = async (
    access:
        {
            access_description: string,
            access_mac: string,
            access_user: number
        },
    access_proof: Express.Multer.File,
    userId: number
): Promise<HttpStatus> => {
    if (
        access.access_description &&
        access.access_mac &&
        access.access_user &&
        userId &&
        access_proof.originalname.match(/\.(jpg|jpeg|png)$/i)
    ) {
        const mac_address = MacAdressVerification(access.access_mac)
        const [access_id, user_rank] = await Promise.all([
            Database.promisedQuery(
                'SELECT access_id FROM access WHERE access_mac =?', [mac_address]
            ),
            Database.promisedQuery(
                'SELECT  `user_rank` FROM `users` WHERE `user_id`=?', [userId]
            )
        ]) as [{ access_id: number }[], { user_rank: string }[]]

        if (access_id.length === 0 && mac_address !== "") {
            if (userId === access.access_user || user_rank[0].user_rank === 'admin') {
                const filename = await optimizeImage(access_proof)

                await Promise.all([
                    Database.promisedQuery(
                        'INSERT INTO `access`(`access_description`, `access_mac`, `access_proof`, `access_user`, `access_state`) VALUES (?, ?, ?, ?, ?)',
                        [
                            access.access_description,
                            mac_address,
                            filename,
                            userId,
                            "pending"
                        ]
                    ),
                    RadiusDatabase.promisedQuery(
                        'INSERT INTO `radusergroup`(`username`, `groupname`, `priority`) VALUES (?, ?, ?)',
                        [mac_address, "Disabled-Users", 0]
                    ),
                    RadiusDatabase.promisedQuery(
                        'INSERT INTO `radcheck`(`username`, `attribute`, `op`, `value`) VALUES (?, ?, ?, ?)',
                        [mac_address, "Auth-Type", ":=", "Accept"]
                    )
                ])

                return HttpStatus.OK
            }

            return HttpStatus.UNAUTHORIZED
        }
        
        return HttpStatus.CONFLICT
    }
    
    return HttpStatus.PARTIAL_CONTENT
}