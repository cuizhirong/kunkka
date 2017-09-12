const config = require('./webpack.config.js');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const fs = require('fs');
const path = require('path');

let language = process.env.npm_config_lang || process.env.language;

// Default language
if (!language) {
  language = 'zh-CN';
}

let applications = fs.readdirSync('./applications').filter(function(m) {
  return fs.statSync(path.join('./applications', m)).isDirectory();
});
let apps = (process.env.npm_config_app && process.env.npm_config_app.split(',')) || applications;
let entry = {};
apps.forEach(function(m) {
  entry[m] = './applications/' + m + '/index.jsx';
});

config.entry = entry;

config.watch = true;
// config.keepAlive = true;
config.devtool = 'cheap-source-map';
// config.debug = true;

config.output.path = path.resolve(__dirname, './dist');
config.output.filename = language + '.[name].min.js';
config.output.chunkFilename = language + '.[id].bundle.js';
config.plugins = [
  new ExtractTextPlugin({filename: '[name].min.css'}),
  new webpack.LoaderOptionsPlugin({
    debug: true
  })
];

module.exports = config;
