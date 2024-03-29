import { HttpStatus, Injectable } from '@nestjs/common';
import { cancelPayment } from './functions/cancelPayment';
import { startPayment } from './functions/startPayment';
import { successPayment } from './functions/successPayment';

@Injectable()
export class LydiaService {
    cancelPayment(ticket_id: string): Promise<HttpStatus> {
        return cancelPayment(ticket_id);
    }

    successPayment(ticket_id: string): Promise<HttpStatus> {
        return successPayment(ticket_id);
    }

    startPayment(user_id: number): Promise<string> {
        return startPayment(user_id);
    }
}
