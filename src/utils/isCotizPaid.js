const isCotizPaid = (req, res, next) => {
    if(req.session['user_pay_status'] == 0)
        res.redirect('/user/profile/');
    else
        next();
}

module.exports = { isCotizPaid };