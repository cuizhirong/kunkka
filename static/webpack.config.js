var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var I18nPlugin = require("i18n-webpack-plugin");

var languages = require('../i18n/shared/lang.json');

module.exports = Object.keys(languages).map(function(language) {

  return {
    context: __dirname,

    entry: {
      login: './dashboard/login/index.jsx',
      main: './dashboard/index.js'
    },

    output: {
      path: 'static/dist',
      filename: '[hash:6].' + language + '.[name].min.js',
      publicPath: '/static/dist',
      chunkFilename: '[hash:6].' + language + '.[id].bundle.js'
    },

    module: {
      loaders: [{
        test: /\.js(.*)$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          cacheDirectory: true
        }
      }, {
        test: /\.json$/,
        loader: 'json-loader'
      }, {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract(
          'css?sourceMap&-minimize!' + 'autoprefixer-loader!' + 'less?sourceMap'
        )
      }, {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(
          'css?sourceMap&-minimize!' + 'autoprefixer-loader'
        )
      }]
    },

    plugins: [
      new ExtractTextPlugin('[hash:6].[name].min.css'),
      new I18nPlugin(languages[language]),
      new webpack.optimize.UglifyJsPlugin()
    ],

    resolve: {
      extensions: ['', '.jsx', '.js'],
      root: path.resolve('../'),
      alias: {
        jquery: 'node_modules/jquery/dist/jquery'
      }
    }
  };
});
