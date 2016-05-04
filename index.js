#!/usr/bin/env node
var pkg = require('package.json');
var boot = require('boot');
var http = require('http');
var config = require('server/config');

var start = Date.now();
var port = config('port') || 5678;
var app = boot();

console.log('%s booted in %dms - port: %s', pkg.name, (Date.now()) - start, port);

var server = http.createServer(app);
server.listen(port);

module.exports = server;
