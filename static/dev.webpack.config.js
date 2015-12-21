var config = require('./webpack.config.js');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

config.watch = true;
config.keepAlive = true;
config.devtool = 'source-map';
config.debug = true;


config.output.path = 'dist';
config.output.filename = '[name].min.js';
config.output.chunkFilename = '[id].bundle.js';
config.plugins = [new ExtractTextPlugin('[name].min.css')];

module.exports = config;
