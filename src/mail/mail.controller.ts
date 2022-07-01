import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import { Database } from 'src/utils/database';
import { Response } from 'express';
import * as replace from 'stream-replace';
import * as fs from 'fs';
import { Transporter } from 'src/utils/mail';


@ApiTags('mail')
@Controller('mail')
export class MailController {
    @ApiOperation({
        summary: 'Create token to reset password and send it by mail',
    })
    @ApiResponse({ status: 200, description: 'A Token is created' })
    @ApiResponse({ status: 204, description: 'No Token send because no users found linked to this email address' })
    @ApiConsumes('application/json')
    @ApiBody({ type: "president@amnet.fr" })
    @Post('password-reset')
    async add(
        @Res({ passthrough: true }) res: Response,
        @Body() { user_email: email }
    ): Promise<string> {

        const user = (await Database.promisedQuery(
            'SELECT user_id, user_name FROM users WHERE user_email=?', [email]
        )) as { user_id: string, user_name: string }[];

        if (user.length === 1) {
            const token_value = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            await Database.promisedQuery('INSERT INTO `reset_token`(`token_user`, `token_value`) VALUES (?, ?)', [user[0].user_id, token_value]);
            
            const reset_link = process.env.HOSTNAME + "/homepage/lostpassword/" + token_value;
            const htmlstream = fs.createReadStream('./src/mail/templates/password.html').pipe(replace(/<LINK_HERE>/g, reset_link)).pipe(replace("<ID_HERE>", user[0]['user_name']));
            
            await Transporter.sendMail('Mot de passe ou Identifiant oublié ?', htmlstream, [email]);

            res.status(HttpStatus.OK)
            return "The token is created and sent by email";
        }
        else {
            res.status(HttpStatus.NO_CONTENT);
            return "No users found linked to this email address";
        }
    }

    @ApiOperation({
        summary: 'Send mail to Users',
    })
    @ApiResponse({ status: 200, description: 'A User is created' })
    @ApiResponse({ status: 204, description: 'No mail send because no recipients' })
    @ApiResponse({
        status: 409,
        description: 'No user is created because of email and/or name already used',
    })

    @ApiConsumes('application/json')
    @Post('info')
    async send(
        @Res({ passthrough: true }) res: Response,
        @Body()
        subject: string,
        content: string,
        recipients: {
            "Contribution": boolean,
            "NoContribution": boolean,
            "OldPromotion": boolean,
            "ActivePromotion": boolean,
            "NewPromotion": boolean,
            "Other": boolean,
            "AllSelect": boolean
        }
    ): Promise<void> {
        let email_users: { user_email: string }[];

        if (recipients.AllSelect || (
            recipients.Contribution &&
            recipients.NoContribution &&
            recipients.OldPromotion &&
            recipients.ActivePromotion &&
            recipients.NewPromotion &&
            recipients.Other)) {

            email_users = (await Database.promisedQuery('SELECT user_email FROM users WHERE `user_notification` = 1')) as { user_email: string }[];
        }
        else {
            if ((recipients.Contribution || recipients.NoContribution) && (recipients.OldPromotion || recipients.ActivePromotion || recipients.NewPromotion || recipients.Other)) {
                const active_promotion = (await Database.promisedQuery('SELECT `setting_value` FROM settings WHERE setting_name = "active_proms"'))[0].setting_value as string;
                const old_promotion = (Number(active_promotion) - 1).toString();
                const new_promotion = (Number(active_promotion) + 1).toString();
                const user_pay_status = recipients.Contribution ? recipients.NoContribution ? "1, 0" : "1" : "0"
                let user_proms = (recipients.OldPromotion ? old_promotion + "," : "") + (recipients.ActivePromotion ? active_promotion + "," : "") + (recipients.NewPromotion ? new_promotion : "")


                if (user_proms.charAt(user_proms.length - 1) === ',') {
                    user_proms = user_proms.slice(0, -1)
                }

                if (recipients.Other) {
                    const other = old_promotion + "," + active_promotion + "," + new_promotion

                    email_users = (await Database.promisedQuery(
                        'SELECT user_email FROM users WHERE user_pay_status IN (?) AND user_proms IN (?) OR user_proms NOT IN (?) AND `user_notification` = 1', [user_pay_status, user_proms, other]
                    )) as { user_email: string }[];
                }
                else {
                    email_users = (await Database.promisedQuery(
                        'SELECT user_email FROM users WHERE user_pay_status IN (?) AND `user_notification` = 1', [user_pay_status]
                    )) as { user_email: string }[];
                }
            }
            else {
                res.status(HttpStatus.NO_CONTENT)
            }
        }

        if (email_users) {
            let emails: string[];
            email_users.forEach((email) => { emails.push(email.user_email) })
            const htmlstream = fs.createReadStream('./src/mail/templates/info.html').pipe(replace('<TEXT_HERE>', content))

            await Transporter.sendMail(subject, htmlstream, ['contact@amnet.fr'], emails);
            res.status(HttpStatus.OK)
        }
    }
}
