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