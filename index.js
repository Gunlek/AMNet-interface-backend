var express = require('express');
let session = require('express-session');

var app = express();

app.use(session({
    secret: "amnet-interface"
}));

require('./access')(app);           // Handle all requests from user management
require('./internet')(app);         // Handle management of internet requests and access
require('./material')(app);         // Handle management of material requests and access
require('./tickets')(app);          // Handle management of tickets and user-requests

app.use(express.static('statics'));

app.get('/', (req, res) => {
    res.render('users/login.html.twig');
});

app.get('/index', (req, res) => {
    res.render('index.html.twig');
});

app.use(function(req, res, next){
    res.status(404).render('errors/404.html.twig');
});

app.listen(8080);