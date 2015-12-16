var config = require('./webpack.config.js');

config.watch = true;
config.keepAlive = true;
config.devtool = 'source-map';
config.debug = true;

//
config.output.path = 'dist';

module.exports = config;
