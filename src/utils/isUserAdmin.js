/**
 * Middleware to ensure that the user that does the request is an admin
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const isUserAdmin = (req, res, next) => {
    if(req.session['user_rank'] != "admin")
    {
        res.redirect('/');
    }
    else {
        next();
    }
}

module.exports = { isUserAdmin };