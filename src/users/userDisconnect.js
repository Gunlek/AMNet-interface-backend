/*
 * Handle disconnection requests and redirect user to index
*/
const UserDisconnect = (req, res) => {
    req.session['logged_in'] = false;
    req.session['user_id'] = -1;
    req.session['user_name'] = "";
    req.session['user_pay_status'] = "";
    res.redirect('/');
}

module.exports = { UserDisconnect };
