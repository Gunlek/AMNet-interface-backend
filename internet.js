module.exports = (app, data) => {
    app.get('/internet/policy/', (req, res) => {
        res.render('internet/policy.html.twig', {data: data});
    });
}