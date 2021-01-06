/*
 * Displays the log-in page
*/
const UserLogin = (req, res) => {
    let login_failed = false;
    if(req.query.state != null && req.query.state === "failed")
        login_failed = true;
    res.render('users/login.html.twig', {data: req.session, login_failed: login_failed});
}

module.exports = { UserLogin };
