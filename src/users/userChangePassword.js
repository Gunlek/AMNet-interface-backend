/*
 * Displays the reset-password page that correspond to the specified
 * token (via GET)
*/
const UserChangePassword = (req, res) => {
    let token = req.params.token;
    let update_failed = false;
    if(req.query.state != null){
        update_failed = true;
        fail_reason = req.query.state;
    }
    res.render('users/change_password.html.twig', {data: req.session, token: token, update_failed: update_failed, fail_reason: fail_reason});
}

module.exports = { UserChangePassword };
