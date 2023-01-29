import { Database } from "src/utils/database";
import { Transporter } from "src/utils/mail";
import { HttpStatus } from "@nestjs/common";
import { createMailTemplate } from "src/utils/file";

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
    let email_users: { user_email: string, gadzflix_id: string }[];
    const atLeatOnePromotion = body.recipients.OldPromotion || body.recipients.ActivePromotion || body.recipients.NewPromotion;

    if (body.recipients.AllSelect || (
        body.recipients.Contribution &&
        body.recipients.NoContribution &&
        body.recipients.OldPromotion &&
        body.recipients.ActivePromotion &&
        body.recipients.NewPromotion &&
        body.recipients.Other)) {

        email_users = (await Database.promisedQuery(
            'SELECT user_email, `gadzflix_id` FROM users WHERE `user_notification` = 1'
        )) as { user_email: string, gadzflix_id: string }[];
    }
    else if (
        (body.recipients.Contribution || body.recipients.NoContribution) &&
        (atLeatOnePromotion || body.recipients.Other)
    ) {
        const [activePromotion, usins_state] = await Promise.all([
            Database.promisedQuery(
                'SELECT `setting_value` FROM settings WHERE setting_name = "active_proms"'
            ),
            Database.promisedQuery(
                'SELECT `setting_value` FROM settings WHERE setting_name = "usins_state"'
            )
        ]) as [{ setting_value: string }[], { setting_value: string }[]];

        const active_promotion = activePromotion[0].setting_value;

        const old_promotion = (Number(active_promotion) - 1).toString();
        const new_promotion = (Number(active_promotion) + Number(usins_state[0].setting_value) ? 1801 : 1).toString();
        const user_pay_status = body.recipients.Contribution ? body.recipients.NoContribution ? [1, 0] : 1 : 0;
        const other = [old_promotion, active_promotion, new_promotion];
        let user_proms = [] as string[];

        if (body.recipients.OldPromotion) user_proms.push(old_promotion);
        if (body.recipients.ActivePromotion) user_proms.push(active_promotion);
        if (body.recipients.NewPromotion) user_proms.push(new_promotion);

        if (body.recipients.Other && atLeatOnePromotion) {
            email_users = (await Database.promisedQuery(
                'SELECT user_email, `gadzflix_id` FROM users WHERE user_pay_status IN (?) AND (user_proms IN (?) OR user_proms NOT IN (?)) AND `user_notification` = 1',
                [user_pay_status, user_proms, other]
            )) as { user_email: string, gadzflix_id: string }[];
        }
        else if (atLeatOnePromotion) {
            email_users = (await Database.promisedQuery(
                'SELECT user_email, `gadzflix_id` FROM users WHERE user_pay_status IN (?) AND user_proms IN (?) AND `user_notification` = 1',
                [user_pay_status, user_proms]
            )) as { user_email: string, gadzflix_id: string }[];
        }
        else {
            email_users = (await Database.promisedQuery(
                'SELECT user_email, `gadzflix_id` FROM users WHERE user_pay_status IN (?) AND user_proms NOT IN (?) AND `user_notification` = 1',
                [user_pay_status, other]
            )) as { user_email: string, gadzflix_id: string }[];
        }
    }

    if (email_users) {
        const adminHtmlstream = createMailTemplate(body.content, '');
        Transporter.sendMail(body.subject, adminHtmlstream, ['contact@amnet.fr']);
        email_users.map((email) => { 
            const htmlstream = createMailTemplate(body.content, email.gadzflix_id);
            Transporter.sendMail(body.subject, htmlstream, [email.user_email]); 
        })

        return HttpStatus.OK;
    }

    return HttpStatus.BAD_REQUEST
}; 