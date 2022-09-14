import { HttpStatus } from "@nestjs/common";
import { Database, RadiusDatabase } from "src/utils/database";
import { createMailTemplate } from "src/utils/file";
import { Transporter } from "src/utils/mail";

export const disableAccess = async (id: number, reason: string): Promise<HttpStatus> => {
    const access = await Database.promisedQuery(
        'SELECT `access_description`, `access_user`, `access_mac` FROM `access` WHERE access_id=?',
        [id]
    ) as { access_description: string, access_user: number, access_mac: string }[];

    if (access.length === 1) {
        await Promise.all([
            Database.promisedQuery(
                'UPDATE `access` SET `access_state`="declined", `declined_reason`=? WHERE access_id=?',
                [reason, id]
            ),
            RadiusDatabase.promisedQuery(
                'UPDATE `radusergroup` SET `groupname`="Disabled-Users" WHERE `username`=?',
                [access[0].access_mac]
            )
        ]);

        const email = await Database.promisedQuery(
            'SELECT `user_email` FROM `users` WHERE user_id=? AND user_notification=1',
            [access[0].access_user]
        ) as { user_email: string }[];

        if (email.length === 1) {
            const reasonExist = typeof reason === 'string' && reason !== '';
            const text = `
                <div style="text-align: center;">
                    <div>
                        Votre demande d'accès pour l'objet <br>
                        <span style="color: #096a09; font-weight: bold;">${access[0].access_description}</span> a été refusée
                    </div>
                    ${reasonExist ? `<div style="margin-top: 15px;">Pour le motif suivant : <br> ${reason}</div>` : ""}
                </div>
            `;
            const htmlstream = createMailTemplate(text);
            await Transporter.sendMail('Votre demande d\'accès été refusée', htmlstream, [email[0].user_email]);
        }

        return HttpStatus.OK
    }

    return HttpStatus.BAD_REQUEST;
}