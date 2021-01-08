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