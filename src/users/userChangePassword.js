/*
 * Displays the reset-password page that correspond to the specified
 * token (via GET)
*/
const UserChangePassword = (req, res) => {
    let token = req.params.token;
    let password_change_failed = false;
    if(req.query.state != null && req.query.state === "failed")
        password_change_failed = true;
    res.render('users/change_password.html.twig', {data: req.session, token: token, password_change_failed: password_change_failed});
}

module.exports = { UserChangePassword };
