const { DatabaseSingleton } = require('../utils/databaseSingleton');
const axios = require('axios');

require('dotenv').config();

/**
 * Handle lydia payment REST request (request/do)
 */
const UserDoPayment = (req, res) => {
    let database = DatabaseSingleton.getInstance().getDatabase();
    const randomString = (len) => {
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let str = "";
        for(let k=0; k<len; k++){
            str += possible[Math.floor(Math.random() * possible.length)];
        }

        return str;
    }
    let user_phone = req.params.user_phone;
    if(user_phone.length >= 10){
        if(user_phone.length == 10 && user_phone[0] == "0")
            user_phone = "+33" + user_phone.substring(1);
        
        let ticketId = randomString(58);

        database.query('SELECT * FROM settings WHERE setting_name = "lydia_token" OR setting_name="lydia_cotiz";', (err, results, fields) => {
            if(results.length > 1){
                let lydiaToken = "";
                let cotizAmount = 0.0;
                if(results[0]['setting_name'] === "lydia_cotiz"){
                    cotizAmount = parseFloat(results[0]['setting_value']);
                    lydiaToken = results[1]['setting_value'];
                }
                else {
                    cotizAmount = parseFloat(results[1]['setting_value']);
                    lydiaToken = results[0]['setting_value'];
                }
                let parameters = new URLSearchParams();
                parameters.append("message", "Paiement cotisation AMNet");
                parameters.append("amount", cotizAmount.toString());
                parameters.append("currency", "EUR");
                parameters.append("type", "phone");
                parameters.append("recipient", user_phone);
                parameters.append("vendor_token", lydiaToken);
                parameters.append("payment_method", "auto");
                parameters.append("confirm_url", process.env.APP_DOMAIN + "/user/payment/success/" + ticketId);
                parameters.append("cancel_url", process.env.APP_DOMAIN + "/user/payment/cancel/" + ticketId);
                parameters.append("expire_url", process.env.APP_DOMAIN + "/user/payment/cancel/" + ticketId);
                parameters.append("browser_success_url", process.env.DEBUG == "true" ? "http://localhost:"+process.env.SERVER_PORT+"/user/success-cotiz-payment/" : process.env.APP_DOMAIN + "/user/success-cotiz-payment/");
                parameters.append("browser_fail_url ", process.env.DEBUG == "true" ? "http://localhost:"+process.env.SERVER_PORT+"/?payment_err=1" : process.env.APP_DOMAIN + "/?payment_err=1");
                parameters.append("display_confirmation", "no");
                
                axios({
                    method: "POST",
                    url: process.env.LYDIA_API_URL + '/api/request/do.json',
                    data: parameters
                })
                .then((response) => {
                    let { request_id, request_uuid, mobile_url } = response.data;
                    database.query('INSERT INTO lydia_transactions(request_ticket, request_id, request_uuid, request_amount, request_payer_id) VALUES(?, ?, ?, ?, ?)', [ticketId, request_id, request_uuid, cotizAmount.toString(), req.session['user_id']], (err) => {
                        if(err)
                            console.log(err);
                        else
                            res.redirect(mobile_url);
                    });
                })
                .catch((err) => console.log(err));
            }
        });
    }
    else {
        res.redirect('/user/profile/?phone_err=1');
    }
}

module.exports = { UserDoPayment };
