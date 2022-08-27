import { HttpStatus } from "@nestjs/common";
import { Database, RadiusDatabase } from "src/utils/database";
import { Transporter } from "src/utils/mail";
import { createMailTemplate } from "src/utils/file";

export const enableAccess = async (id: number): Promise<HttpStatus> => {
    const access = await Database.promisedQuery(
        'SELECT `access_description`, `access_user`, `access_mac` FROM `access` WHERE access_id=?',
        [id]
    ) as { access_description: string, access_user: number, access_mac: string }[];

    if (access.length === 1) {
        await Promise.all([
            Database.promisedQuery(
                'UPDATE `access` SET `access_state`="active" WHERE access_id=?',
                [id]
            ),
            RadiusDatabase.promisedQuery(
                'UPDATE `radusergroup` SET `groupname`="Enabled-Users" WHERE `username`=?',
                [access[0].access_mac]
            ),
        ])

        const email = await Database.promisedQuery(
            'SELECT `user_email` FROM `users` WHERE user_id=? AND user_notification=1',
            [access[0].access_user]
        ) as { user_email: string }[];

        if (email.length === 1) {
            const text = `<div style="text-align: center;">Votre demande d'accès pour l'objet <span style="color: #096a09; font-weight: bold;">` + access[0].access_description + `</span> a été acceptée. <br><br> Vous pouvez dès maintenant le connecter à <span style="color: #096a09; font-weight: bold;">AMNet IoT</span></div>`;
            const htmlstream = createMailTemplate(text);
            await Transporter.sendMail('Votre demande a été aceptée', htmlstream, [email[0].user_email]);
        }

        return HttpStatus.OK
    }
    else return HttpStatus.BAD_REQUEST
}