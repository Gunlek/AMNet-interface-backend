var express = require('express');

var app = express();

var data = {logged_in: false};

require('./access')(app, data);
require('./internet')(app, data);

app.use(express.static('statics'));

app.get('/', (req, res) => {
    res.render('index.html.twig', {data: data});
});

app.listen(8080);