var configs = require('./webpack.config.js');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var I18nPlugin = require("i18n-webpack-plugin");

var languages = require('../i18n/shared/lang.json');

var language = process.env.npm_config_lang;

var config = configs[0];

config.watch = true;
config.keepAlive = true;
config.devtool = 'source-map';
config.debug = true;


config.output.path = 'dist';
config.output.filename = language + '.[name].min.js';
config.output.chunkFilename = language + '.[id].bundle.js';
config.plugins = [
  new ExtractTextPlugin('[name].min.css'),
  new I18nPlugin(languages[language])
];

module.exports = config;
