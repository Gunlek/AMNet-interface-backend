import { Database } from "src/utils/database";
import * as crypto from 'crypto';
import axios from "axios";

export const startPayment = async (id: number): Promise<string> => {
    const [user, lydia_cotiz] = await Promise.all([
        Database.promisedQuery(
            'SELECT user_phone FROM users WHERE user_id=?', [id]
        ),
        Database.promisedQuery(
            'SELECT setting_value FROM `settings` WHERE setting_name=?', ["lydia_cotiz"]
        )
    ]) as [{ user_phone: string }[], { setting_value: string }[]];

    if (user.length === 1 && user[0].user_phone.length >= 10) {
        const ticketId = crypto.randomBytes(64).toString('hex');
        
        const parameters = {
            message: "Paiement cotisation AMNet",
            amount: lydia_cotiz[0].setting_value,
            currency: "EUR",
            type: "phone",
            recipient: "user_phone",
            vendor_token: process.env.LYDIA_TOKEN,
            payment_method: "auto",
            confirm_url: `${process.env.REST_API}/lydia/success/${ticketId}`,
            cancel_url: `${process.env.REST_API}/lydia/cancel/${ticketId}`,
            expire_url: `${process.env.REST_API}/lydia/cancel/${ticketId}`,
            browser_success_url: `${process.env.HOSTNAME}`,
            browser_fail_url: `${process.env.HOSTNAME}?payment_err=1`,
            display_confirmation: "no"
        };

        const { request_id, request_uuid, mobile_url } = await (await axios.post(`${process.env.LYDIA_API_URL}/api/request/do.json`, parameters)).data;

        await Database.promisedQuery(
            'INSERT INTO lydia_transactions(request_ticket, request_id, request_uuid, request_amount, request_payer_id) VALUES(?, ?, ?, ?, ?)',
            [ticketId, request_id, request_uuid, lydia_cotiz[0].setting_value, id]
        );

        return mobile_url;
    }

    return '/profile/?phone_err=1';
}