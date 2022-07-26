import { Database } from "src/utils/database";
import * as crypto from 'crypto';
import axios from "axios";

export const startPayment = async (id: number): Promise<string> => {
    const [user, lydia_cotiz] = await Promise.all([
        Database.promisedQuery(
            'SELECT user_phone, user_pay_status FROM users WHERE user_id=?', [id]
        ),
        Database.promisedQuery(
            'SELECT setting_value FROM `settings` WHERE setting_name=?', ["lydia_cotiz"]
        )
    ]) as [{ user_phone: string, user_pay_status: number }[], { setting_value: string }[]];

    if (user.length === 1  && user[0].user_pay_status == 0) {
        const ticketId = crypto.randomBytes(64).toString('hex');

        const parameters = new URLSearchParams();
        parameters.append("message", "Paiement cotisation AMNet");
        parameters.append("amount", lydia_cotiz[0].setting_value);
        parameters.append("currency", "EUR");
        parameters.append("type", "phone");
        parameters.append("recipient", user[0].user_phone);
        parameters.append("vendor_token", process.env.LYDIA_TOKEN);
        parameters.append("payment_method", user[0].user_phone.length >=10 ? "auto" : "cb");
        parameters.append("confirm_url", `${process.env.REST_API}/lydia/success/${ticketId}`);
        parameters.append("cancel_url", `${process.env.REST_API}/lydia/cancel/${ticketId}`);
        parameters.append("expire_url", `${process.env.REST_API}/lydia/cancel/${ticketId}`);
        parameters.append("browser_success_url", `${process.env.HOSTNAME}`);
        parameters.append("browser_fail_url ", `${process.env.HOSTNAME}?payment_err=1`);
        parameters.append("display_confirmation", "no");

        const { request_id, request_uuid, mobile_url } = await (await axios.post(`${process.env.LYDIA_API_URL}/api/request/do.json`, parameters)).data;

        Database.promisedQuery(
            'INSERT INTO lydia_transactions(request_ticket, request_id, request_uuid, request_amount, request_payer_id) VALUES(?, ?, ?, ?, ?)',
            [ticketId, request_id, request_uuid, lydia_cotiz[0].setting_value, id]
        );

        return mobile_url;
    }

    return '/profile';
}