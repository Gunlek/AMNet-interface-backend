var express = require('express');
let session = require('express-session');

var app = express();

app.use(session({
    secret: "amnet-interface",
    resave: false,
    saveUninitialized: false,
}));

require('./users')(app);           // Handle all requests from user management
require('./internet')(app);         // Handle management of internet requests and access
require('./material')(app);         // Handle management of material requests and access
require('./tickets')(app);          // Handle management of tickets and user-requests
require('./admin')(app);          // Handle all administration interfaces and actions

app.use(express.static('statics'));

app.get('/', (req, res) => {
    if(!req.session['logged_in'])
        res.redirect('users/login/');
    else
        res.render('index.html.twig', {data: req.session});
});

app.use(function(req, res, next){
    res.status(404).render('errors/404.html.twig', {data: req.session});
});

app.listen(8080);