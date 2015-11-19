'use strict';

var express = require('express');
var path = require('path');
var yaml = require('js-yaml');
var fs = require('fs');
var http = require('http');

var morgan = require('morgan');
var bodyParser = require('body-parser');

var app = express();

app.use(morgan('combined'))
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.set('port', process.env.PORT || 5000);
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine({ beautify: true }));


var config;
try {
    config = yaml.safeLoad(fs.readFileSync(path.resolve('./config.yml'), 'utf8'));
    global.config = config;
} catch (e) {
    global.config = {};
}

app.use('/auth', require('./controllers/auth'));
app.use('/static', express.static(__dirname + '/static'));
app.use('/', function(req, res) {
    res.render('login', {title: 'Login'});
});

//start the app
http.createServer(app).listen(app.get('port'), function() {
    console.info('Server listening on port ' + app.get('port'));
});