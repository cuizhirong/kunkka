module.exports = {
    context: __dirname,
    entry: {
        login: './static/login/app.js', 
        main: './static/dashboard/app.js'
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
        path: __dirname + '/static',
        filename: 'main-[name].min.js',
        publicPath: '/static/',
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