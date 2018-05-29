const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

let entry = {};
fs.readdirSync('./applications')
  .filter(function(m) {
    return fs.statSync(path.join('./applications', m)).isDirectory();
  })
  .forEach(function(m) {
    entry[`en.${m}`] = `./applications/${m}/languages/en.js`;
    entry[`zh-CN.${m}`] = `./applications/${m}/languages/zh.js`;
  });

module.exports = env => {

  let webpackConfig = {
    context: __dirname,

    entry: entry,

    output: {
      path: path.resolve(__dirname, './dist'),
      filename: env === 'production' ? '[hash:6].' + '[name].lang.min.js' : '[name].lang.min.js',
      publicPath: '/client/dist'
    },

    resolve: {
      modules: [
        path.resolve(__dirname, '../')
      ]
    }

  };

  if(env === 'production') {
    webpackConfig.plugins = [
      new webpack.optimize.UglifyJsPlugin()
    ];
  }

  return webpackConfig;

};
