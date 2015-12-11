var path = require('path');

console.log(__dirname)

module.exports = {
  context: __dirname,

  entry: {
    login: './login/app.js',
    main: './dashboard/app.js'
  },

  output: {
    path: 'static/dist/js',
    filename: '[hash].[name].min.js',
    publicPath: path.resolve(__dirname, 'static'),
    chunkFilename: '[hash].[id].bundle.js'
  },

  module: {
    loaders: [{
      test: /\.js(.*)$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        cacheDirectory: true
      }
    }]
  },

  plugins: [],

  resolve: {
    extensions: ['', '.jsx', '.js'],
    root: path.resolve('../'),
    alias: {
      jquery: 'node_modules/jquery/dist/jquery'
    }
  }
};
