import { HttpStatus, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { createResetToken } from './functions/createResetToken';
import { notifyAdmins } from './functions/notifyAdmins';
import { notifyUsers } from './functions/notifyUsers';

@Injectable()
export class MailService {
    createResetToken(email: string): Promise<HttpStatus> {
        return createResetToken(email);
    };

    notifyUsers(body: any): Promise<HttpStatus> {
        return notifyUsers(body);
    };

    @Cron('0 20 * * *')
    async notifyAdmins() {
        notifyAdmins()
    };
}
