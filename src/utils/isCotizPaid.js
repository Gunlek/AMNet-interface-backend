/**
 * Middleware to ensure that the user that does the request has paid his request
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const isCotizPaid = (req, res, next) => {
    if(req.session['user_pay_status'] == 0)
        res.redirect('/users/profile/');
    else
        next();
}

module.exports = { isCotizPaid };