import { Database } from "src/utils/database";
import { payUser } from "src/user/functions/payUser";
import { HttpStatus } from "@nestjs/common";

export const successPayment = async (ticket_id: string): Promise<HttpStatus> => {
    const user = await Database.promisedQuery(
        'SELECT request_payer_id FROM lydia_transactions WHERE request_ticket = ?', 
        [ticket_id]
    ) as { request_payer_id: number }[];

    if (user.length === 1) {
        await Database.promisedQuery(
            'DELETE FROM `lydia_transactions` WHERE request_ticket = ?', 
            [ticket_id]
        );
        payUser(user[0].request_payer_id);

        return HttpStatus.OK;
    }

    return HttpStatus.BAD_REQUEST;
}