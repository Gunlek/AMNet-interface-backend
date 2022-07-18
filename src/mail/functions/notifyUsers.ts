import { Database } from "src/utils/database";
import { Transporter } from "src/utils/mail";
import * as replace from 'stream-replace';
import * as fs from 'fs';
import { HttpStatus } from "@nestjs/common";
import DOMPurify from 'isomorphic-dompurify';

export const notifyUsers = async (body:
    {
        recipients:
        {
            AllSelect: boolean;
            Contribution: boolean;
            NoContribution: boolean;
            OldPromotion: boolean;
            ActivePromotion: boolean;
            NewPromotion: boolean;
            Other: boolean;
        };
        content: string;
        subject: string;
    }
): Promise<HttpStatus> => {
    let email_users: { user_email: string }[];

    if (body.recipients.AllSelect || (
        body.recipients.Contribution &&
        body.recipients.NoContribution &&
        body.recipients.OldPromotion &&
        body.recipients.ActivePromotion &&
        body.recipients.NewPromotion &&
        body.recipients.Other)) {

        email_users = (await Database.promisedQuery(
            'SELECT user_email FROM users WHERE `user_notification` = 1'
        )) as { user_email: string }[];
    }
    else {
        if (
            (body.recipients.Contribution || body.recipients.NoContribution) &&
            (
                body.recipients.OldPromotion ||
                body.recipients.ActivePromotion ||
                body.recipients.NewPromotion ||
                body.recipients.Other
            )
        ) {
            const [activePromotion, usins_state] = await Promise.all([
                Database.promisedQuery(
                    'SELECT `setting_value` FROM settings WHERE setting_name = "active_proms"'
                ),
                Database.promisedQuery(
                    'SELECT `setting_value` FROM settings WHERE setting_name = "usins_state"'
                )
            ]) as [{ setting_value: string }[], { setting_value: string }[]]

            const active_promotion = activePromotion[0].setting_value

            const old_promotion = (Number(active_promotion) - 1).toString();
            const new_promotion = (Number(active_promotion) + Number(usins_state[0].setting_value) ? 1801 : 1).toString();
            const user_pay_status = body.recipients.Contribution ? body.recipients.NoContribution ? "1, 0" : "1" : "0"
            let user_proms = (body.recipients.OldPromotion ? old_promotion + "," : "") + (body.recipients.ActivePromotion ? active_promotion + "," : "") + (body.recipients.NewPromotion ? new_promotion : "")

            if (!body.recipients.NewPromotion) {
                user_proms = user_proms.slice(0, -1)
            }

            if (body.recipients.Other) {
                const other = old_promotion + "," + active_promotion + "," + new_promotion

                email_users = (await Database.promisedQuery(
                    'SELECT user_email FROM users WHERE user_pay_status IN (?) AND user_proms IN (?) OR user_proms NOT IN (?) AND `user_notification` = 1', [user_pay_status, user_proms, other]
                )) as { user_email: string }[];
            }
            else {
                email_users = (await Database.promisedQuery(
                    'SELECT user_email FROM users WHERE user_pay_status IN (?) AND user_proms IN (?) AND `user_notification` = 1',
                    [user_pay_status, user_proms]
                )) as { user_email: string }[];
            }
        }

        return HttpStatus.NO_CONTENT
    }

    if (email_users) {
        let emails = [];

        email_users.forEach((email) => { emails.push(email.user_email) })
        const htmlstream = fs.createReadStream('./src/mail/templates/info.html')
            .pipe(replace('<TEXT_HERE>', DOMPurify.sanitize(body.content)))

        await Transporter.sendMail(body.subject, htmlstream, ['contact@amnet.fr'], emails);
        return HttpStatus.OK;
    }
}; 