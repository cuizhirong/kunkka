'use strict';

var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var path = require('path');
var webpackConfig = require(path.resolve(__dirname, '..', '..', 'webpack.config.js'));

module.exports = webpackConfig;

var config = Object.create(webpackConfig);
var compiler = webpack(config);

// Start a webpack-dev-server
new WebpackDevServer(compiler, {
  publicPath: '/' + config.output.publicPath,
  stats: {
    colors: true
  }
}).listen(8080, 'localhost', function(err) {
  console.error('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');
});
