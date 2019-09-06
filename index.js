var express = require('express');
let session = require('express-session');

var app = express();

app.use(session({
    secret: "amnet-interface"
}));

require('./access')(app);
require('./internet')(app);
require('./material')(app);
require('./tickets')(app);

app.use(express.static('statics'));

app.get('/', (req, res) => {
    res.render('index.html.twig', {data: req.session});
});

app.use(function(req, res, next){
    res.status(404).render('errors/404.html.twig');
});

app.listen(8080);