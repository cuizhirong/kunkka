module.exports = {
    context: __dirname,
    entry: ['./static/login/app.js'],
    module: {
        loaders: [{
            test: /\.less$/,
            loader: "style!css!less"
        }, {
            test: /\.png$/,
            loader: "file?prefix=img/"
        }, {
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
        path: __dirname + '/static',
        filename: 'main-[name].min.js',
        publicPath: '/static/',
        chunkFilename: '[id].bundle.js'
    },
    resolve: {
        extensions: ['', '.jsx', '.js'],
        root: __dirname,
        alias: {
            "jquery": "node_modules/jquery/dist/jquery",
            "react": "node_modules/react/react",
            "react-dom": "node_modules/react/lib/ReactDOM",
            "eventemitter": "node_modules/eventemitter2"
        }
    }
}