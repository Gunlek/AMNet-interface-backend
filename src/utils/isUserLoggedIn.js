/**
 * Middleware to ensure that the user that does the request is logged in
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const isUserLoggedIn = (req, res, next) => {
    if(!req.session['logged_in']){
        req.session.returnTo = req.url;
        res.redirect('/users/login/');
    }
    else {
        next();
    }
}

module.exports = { isUserLoggedIn };