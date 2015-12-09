var path = require('path');

module.exports = {
  context: __dirname,

  entry: {
    login: path.resolve(__dirname, 'static', 'login', 'app.js'),
    main: path.resolve(__dirname, 'static', 'dashboard', 'app.js')
  },

  output: {
    path: 'static/dist',
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
    root: __dirname,
    alias: {
      jquery: 'node_modules/jquery/dist/jquery'
    }
  }
};
