var config = require('./webpack.config.js');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var language = process.env.npm_config_lang || process.env.language;

// Default language
if (!language) {
  language = 'zh-CN';
}


config.watch = true;
config.keepAlive = true;
config.devtool = 'source-map';
config.debug = true;


config.output.path = 'dist';
config.output.filename = language + '.[name].min.js';
config.output.chunkFilename = language + '.[id].bundle.js';
config.plugins = [
  new ExtractTextPlugin('[name].min.css')
];

module.exports = config;
