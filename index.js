#!/usr/bin/env node

'use strict';

const pkg = require('package.json');
const boot = require('boot');
const http = require('http');
const config = require('server/config');

const start = Date.now();
const port = config('port') || 5678;
const hostname = config('hostname') || '0.0.0.0';
const app = boot();

console.log('%s booted in %dms - port: %s', pkg.name, (Date.now()) - start, port);

const server = http.createServer(app, hostname);
server.listen(port);

module.exports = server;
