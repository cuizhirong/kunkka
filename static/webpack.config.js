var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  context: __dirname,

  entry: {
    login: './dashboard/login/index.js',
    main: './dashboard/index.js'
  },

  output: {
    path: 'static/dist',
    filename: '[hash:6].[name].min.js',
    publicPath: path.resolve(__dirname, 'static'),
    chunkFilename: '[hash:6].[id].bundle.js'
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

  plugins: [new ExtractTextPlugin('[hash:6].[name].css')],

  resolve: {
    extensions: ['', '.jsx', '.js'],
    root: path.resolve('../'),
    alias: {
      jquery: 'node_modules/jquery/dist/jquery'
    }
  }
};
