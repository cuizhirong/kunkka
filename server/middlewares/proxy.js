var httpProxy = require('http-proxy');
var express = require('express');
var router = express.Router();
var remote = require('config')('remote');

var proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', function (proxyReq, req, res, options) {
  proxyReq.setHeader('X-Auth-Token', req.session.user.token);
  proxyReq.path = '/' + proxyReq.path.split('/').slice(2).join('/');
});


proxy.on('error', function (e) {
  console.log(e);
});

router.all('/*', function (req, res) {
  var region = req.headers.region;
  var service = req.path.split('/')[1];
  proxy.web(req, res, {
    target: remote[service][region]
  });
});

module.exports = router;
