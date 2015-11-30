'use strict';

var pkg = require('package.json');
var boot = require('boot');
var http = require('http');


var start = Date.now();
var port = process.env.PORT || 5000;
var app = boot();

console.log('%s booted in %dms - port: %s', pkg.name, (Date.now()) - start, port);

var server = http.createServer(app);
server.listen(port);

/*

var express = require('express');
var path = require('path');
var yaml = require('js-yaml');
var fs = require('fs');
var http = require('http');

var morgan = require('morgan');
var bodyParser = require('body-parser');

var views = require('express-react-views').createEngine({
    beautify: true
});

var app = express();

// app.use(morgan('combined'))
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded

app.set('port', process.env.PORT || 5000);
app.set('view engine', 'jsx');
app.engine('jsx', views);





app.use('/auth', require('./controllers/auth'));
app.use('/servers', require('./controllers/servers'));
app.use('/static/uskin', express.static(__dirname + '/node_modules/uskin/dist/css'));
app.use('/static', express.static(__dirname + '/static'));
app.use('/', function(req, res) {
    if (req.session && req.session.token) {
        res.render('index', {
            title: 'Dashboard'
        });
    } else {
        res.render('login', {
            title: 'Login'
        });
    }
});

//start the app
http.createServer(app).listen(app.get('port'), function() {
    console.info('Server listening on port ' + app.get('port'));
});
*/