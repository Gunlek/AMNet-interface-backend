let session = require('express-session');

module.exports = (app) => {

    app.use(session({
        secret: "amnet-interface"
    }));

    app.get('/internet/policy/', (req, res) => {
        res.render('internet/policy.html.twig', {data: req.session});
    });
}