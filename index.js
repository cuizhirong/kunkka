var pkg = require('package.json');
var boot = require('boot');
var http = require('http');


var start = Date.now();
var port = process.env.PORT || 5000;
var app = boot();

console.log('%s booted in %dms - port: %s', pkg.name, (Date.now()) - start, port);

var server = http.createServer(app);
server.listen(port);
