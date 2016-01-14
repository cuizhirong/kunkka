var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var language = process.env.language;

// Default language
if (!language) {
  language = 'zh-CN';
}

module.exports = {
  context: __dirname,

  entry: {
    login: './login/index.jsx',
    main: './dashboard/index.jsx'
  },

  output: {
    path: 'client/dist',
    filename: '[hash:6].' + language + '.[name].min.js',
    publicPath: '/client/dist',
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
    new ExtractTextPlugin('[hash:6].[name].min.css', {
      allChunks: true
    }),
    new webpack.optimize.UglifyJsPlugin()
  ],

  resolve: {
    extensions: ['', '.jsx', '.js'],
    root: path.resolve('../'),
    alias: {
      'uskin': 'client/uskin',
      'react': 'node_modules/react',
      'react-dom': 'node_modules/react-dom'
    }
  }
};
