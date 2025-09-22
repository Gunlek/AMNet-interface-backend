import { Body, Controller, Get, HttpStatus, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Database } from 'src/utils/database';
import { Response } from 'express';
import { MailService } from './mail.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard, Roles } from 'src/auth/roles.guard';

@ApiTags('mail')
@Controller('mail')
export class MailController {
    constructor(private mailService: MailService) { }

    @ApiOperation({ summary: 'Create token to reset password and send it by mail' })
    @ApiResponse({ status: 200, description: 'A Token is created' })
    @ApiResponse({ status: 204, description: 'No Token send because no users found linked to this email address' })
    @ApiConsumes('application/json')
    @ApiBody({ type: "president@amnet.fr" })
    @Post('password-reset')
    async add(
        @Res({ passthrough: true }) res: Response,
        @Body() { user_email: email }
    ): Promise<void> {
        res.status(await this.mailService.createResetToken(email));
    }

    @ApiOperation({ summary: 'Reverse the setting to allow email notifications' })
    @ApiResponse({ status: 200, description: 'Successful Reverse' })
    @ApiConsumes('application/json')
    @Get('user/:id')
    async getUser(
        @Res({ passthrough: true }) res: Response,
        @Param('id') id: number,
    ): Promise<void> {
        const user = await Database.promisedQuery(
            'SELECT `user_email`,`user_notification` FROM `users` WHERE `gadzflix_id`=?',
            [id]
        );
        res.status(HttpStatus.OK);

        return user[0]
    }

    @ApiOperation({ summary: 'Reverse the setting to allow email notifications' })
    @ApiResponse({ status: 200, description: 'Successful Reverse' })
    @ApiConsumes('application/json')
    @Put('user/:id')
    async unsubscribe(
        @Res({ passthrough: true }) res: Response,
        @Param('id') id: number,
    ): Promise<void> {
        await Database.promisedQuery(
            'UPDATE `users` SET `user_notification`=NOT `user_notification` WHERE `user_id`=?',
            [id]
        );
        res.status(HttpStatus.OK);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Send mail to Users' })
    @ApiResponse({ status: 200, description: 'A User is created' })
    @ApiResponse({ status: 204, description: 'No mail send because no recipients' })
    @ApiConsumes('application/json')
    @UseGuards(JwtAuthGuard)
    @UseGuards(RolesGuard)
    @Roles('admin')
    @Post('info')
    async send(
        @Res({ passthrough: true }) res: Response,
        @Body() body: {
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
        }
    ): Promise<void> {
        res.status(await this.mailService.notifyUsers(body));
    }
}
