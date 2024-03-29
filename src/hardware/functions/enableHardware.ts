import { HttpStatus } from "@nestjs/common";
import { Database } from "src/utils/database";
import { createMailTemplate } from "src/utils/file";
import { Transporter } from "src/utils/mail";

export const enableHardware = async (id: number): Promise<HttpStatus> => {
    const material = await Database.promisedQuery(
        'SELECT `material_user`, `material_description` FROM `materials` WHERE material_id=?',
        [id]
    ) as { material_user: string, material_description: string }[];

    if (material.length === 1) {
        await Database.promisedQuery(
            'UPDATE `materials` SET `material_state`="active" WHERE material_id=?',
            [id]
        )

        const email = await Database.promisedQuery(
            'SELECT `user_email`, `gadzflix_id` FROM `users` WHERE user_id=? AND user_notification=1',
            [material[0].material_user]
        ) as { user_email: string, gadzflix_id: string }[];

        if (email.length === 1) {
            const text = `
                <div style="text-align: center;">
                    <div style="margin-bottom: 15px;">
                        Votre demande de matériel <br>
                        <span style="color: #096a09; font-weight: bold;">${material[0].material_description}</span> a été acceptée 
                    </div>
                    <div>Nous vous contacterons bientôt pour vous le remettre</div>
                </div>`;
            const htmlstream = createMailTemplate(text, email[0].gadzflix_id);
            await Transporter.sendMail('Votre demande de matériel a été acceptée', htmlstream, [email[0].user_email]);
        }

        return HttpStatus.OK
    }
    else return HttpStatus.BAD_REQUEST
}