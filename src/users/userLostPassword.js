/*
 * Displays lost-password page
*/
const UserLostPassword = (req, res) => {
    res.render('users/lost-password.html.twig', {data: req.session, errors: req.query.err});
};

module.exports = { UserLostPassword };
