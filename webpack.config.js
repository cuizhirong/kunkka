var path = require('path');
module.exports = {
    context: __dirname,
    entry: {
        login: path.resolve(__dirname, 'static', 'login', 'app.js'),
        main: path.resolve(__dirname, 'static', 'dashboard', 'app.js')
    },
    module: {
        loaders: [{
            test: /\.js(.*)$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
                cacheDirectory: true,
                presets: ['es2015', 'react']
            }
        }]
    },
    output: {
        path: path.resolve(__dirname, 'static'),
        filename: 'main-[name].min.js',
        publicPath: path.resolve(__dirname, 'static'),
        chunkFilename: '[id].bundle.js'
    },
    resolve: {
        extensions: ['', '.jsx', '.js'],
        root: __dirname,
        alias: {
            "jquery": "node_modules/jquery/dist/jquery"
        }
    }
}