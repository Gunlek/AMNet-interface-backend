import { HttpStatus } from "@nestjs/common";
import { Database } from "src/utils/database";
import { createMailTemplate } from "src/utils/file";
import { Transporter } from "src/utils/mail";

export const disableHardware = async (id: number, reason: string): Promise<HttpStatus> => {
    const material = await Database.promisedQuery(
        'SELECT `material_user`, `material_description` FROM `materials` WHERE material_id=?',
        [id]
    ) as { material_user: string, material_description: string }[];

    if (material.length === 1) {
        await Database.promisedQuery(
            'UPDATE `materials` SET `material_state`="declined", `declined_reason`=? WHERE material_id=?',
            [reason, id]
        );

        const email = await Database.promisedQuery(
            'SELECT `user_email` FROM `users` WHERE user_id=? AND user_notification=1',
            [material[0].material_user]
        ) as { user_email: string }[];

        if (email.length === 1) {
            const reasonExist = typeof reason === 'string' && reason !== ''; 
            const text = `
            <div style="text-align: center;">
                <div>
                    Votre demande de matériel <br>
                    <span style="color: #096a09; font-weight: bold;">${material[0].material_description}</span> a été refusée
                </div>
                ${reasonExist ? `<div style="margin-top: 15px;">Pour le motif suivant : <br> ${reason}</div>` : ""}
            </div>`;
            const htmlstream = createMailTemplate(text);
            await Transporter.sendMail('Votre demande de matériel a été refusée', htmlstream, [email[0].user_email]);
        }

        return HttpStatus.OK
    }

    return HttpStatus.BAD_REQUEST;
}