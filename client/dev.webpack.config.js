var config = require('./webpack.config.js');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var fs = require('fs');
var path = require('path');

var language = process.env.npm_config_lang || process.env.language;

// Default language
if (!language) {
  language = 'zh-CN';
}

var applications =fs.readdirSync('./applications').filter(function(m) {
  return fs.statSync(path.join('./applications', m)).isDirectory();
});
var apps = (process.env.npm_config_app && process.env.npm_config_app.split(',')) || applications;
var entry = {};
apps.forEach(function(m) {
  entry[m] = './applications/' + m + '/index.jsx';
});

config.entry = entry;

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
