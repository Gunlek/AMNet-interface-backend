import { Body, Controller, Get, Param, Post, Put, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import { Database } from 'src/utils/database';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';

@ApiTags('mail')
@Controller('mail')
export class MailController {
    @ApiOperation({
        summary: 'Create token to reset password and send it by mail',
    })
    @ApiResponse({ status: 200, description: 'A User is created' })
    @ApiConsumes('application/json')
    @ApiBody({ type: "president@amnet.fr" })
    @Post('password/reset')
    async add(
        @Res({ passthrough: true }) res: Response,
        @Body() user_email: string
    ): Promise<string> {
        const user_id = (await Database.promisedQuery(
            'SELECT user_id FROM users WHERE user_eamil=?', [user_email]
        )) as { user_id: string }[];

        if (user_id.length === 1) {
            const token_value = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            Database.promisedQuery(
                'INSERT INTO `reset_token`(`token_user`, `token_value`) VALUES (?, ?)', [user_id, token_value]
            );
            //todo : envoyer le mail
            return "The token is created and sent by email";
        }
        else return "No users found linked to this email address";
    }

    @ApiOperation({
        summary: 'Return pseudo linked to the token',
    })
    @ApiResponse({ status: 200, description: 'A User is created' })
    @ApiConsumes('application/json')
    @Get('password/:id')
    async get(
        @Res({ passthrough: true }) res: Response,
        @Param('id') id: string,
    ): Promise<string> {
        const user_id = (await Database.promisedQuery(
            'SELECT token_user FROM reset_token WHERE token_value=?', [id]
        )) as { user_id: string }[];

        if (user_id.length === 1) {
            const user_name = (await Database.promisedQuery(
                'SELECT token_name FROM users WHERE user_id=?', [user_id]
            )) as { user_name: string }[];

            return user_name[0].user_name;
        }
        else return "No users found linked to this token";
    }

    @ApiOperation({
        summary: 'Update user password by tokken',
    })
    @ApiResponse({ status: 200, description: 'The password is upated' })
    @ApiConsumes('application/json')
    @Put('password/:id')
    async put(
        @Res({ passthrough: true }) res: Response,
        @Body() user: { password1: string, password2: string },
        @Param('id') id: string
    ): Promise<string> {
        const user_id = (await Database.promisedQuery(
            'SELECT token_user FROM reset_token WHERE token_value=?', [id]
        )) as { user_id: string }[];

        if (user_id.length === 1) {
            if (user.password1 === user.password2) {
                bcrypt.hash(user.password1, process.env.SALT_ROUND, function (err: any, hash_password: string) {
                    Database.promisedQuery(
                        'UPDATE `users` SET `user_password`=? WHERE user_id=?',
                        [hash_password, user_id[0].user_id]
                    );

                    if (err) return err
                    return "Password is upated"
                });
            }
            else return "The 2 passwords are not the same";
        }
        else return "No users found linked to this token";
    }

    @ApiOperation({
        summary: 'Send mail to Users',
    })
    @ApiResponse({ status: 200, description: 'A User is created' })
    @ApiConsumes('application/json')
    @Post('info')
    async send(
        @Res({ passthrough: true }) res: Response,
        @Body() recipients: {
            "Contribution": boolean,
            "NoContribution": boolean,
            "OldPromotion": boolean,
            "ActivePromotion": boolean,
            "NewPromotion": boolean,
            "Other": boolean,
            "AllSelect": boolean
        }
    ): Promise<string> {
        if (recipients.AllSelect || (
            recipients.Contribution &&
            recipients.NoContribution &&
            recipients.OldPromotion &&
            recipients.ActivePromotion &&
            recipients.NewPromotion &&
            recipients.Other)) {

            const email_users = (await Database.promisedQuery(
                'SELECT user_email FROM users WHERE 1'
            )) as { user_email: string }[];
        }
        else {
            const active_promotion = (await Database.promisedQuery(
                'SELECT `setting_value` FROM settings WHERE setting_name="active_proms"'
            ))[0].setting_value as string;

            const old_promotion = (Number(active_promotion) - 1).toString();
            const new_promotion = (Number(active_promotion) + 1).toString();

            var condition = ""
            const conditionPayStatus = !(recipients.Contribution && recipients.NoContribution)
            const conditionPromotion = !(recipients.ActivePromotion && recipients.NewPromotion && recipients.OldPromotion && recipients.Other)

            if (conditionPayStatus) {
                condition += ("user_pay_status= " + (recipients.Contribution ? "1" : recipients.NoContribution ? "0" : "-1"));
            }

            if (conditionPromotion) {
                condition += conditionPayStatus && (recipients.ActivePromotion || recipients.OldPromotion || recipients.NewPromotion || recipients.Other) ? " AND " : "";
                condition += recipients.ActivePromotion ? "user_proms=" + active_promotion + " OR " : "";
                condition += recipients.OldPromotion ? "user_proms=" + old_promotion + " OR " : "";
                condition += recipients.NewPromotion ? "user_proms=" + new_promotion + " OR " : "";
                condition += recipients.Other ? "user_proms NOT IN (" + new_promotion + ", " + active_promotion + ", " + old_promotion + ")" : "";

                const lastC = condition.charAt(condition.length - 2)
                if (lastC == 'R') {
                    condition = condition.slice(0, -3)
                }
            }

            const email_users = (await Database.promisedQuery(
                'SELECT user_email FROM users WHERE ' + condition
            )) as { user_email: string }[];
        }
        return condition;
    }
}
