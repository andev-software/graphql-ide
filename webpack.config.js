var path = require('path')
var webpack = require('webpack')
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer')

var options = {
    // devtool: 'eval-source-map',
    entry: {
        vendor: [
            'babel-polyfill',
            'react',
            'react-dom',
            'react-router',
            'sweetalert/dist/sweetalert.css'
        ],
        app: [
            './src/index.jsx'
        ]
    },
    output: {
        filename: "[name].js",
        path: './dist'
    },
    resolve: {
        root: path.resolve(__dirname) + '/src',
        extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test: /\.json/,
                loader: require.resolve('json-loader')
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: require.resolve('babel-loader'),
                query: {
                    presets: [
                        require.resolve('babel-preset-es2015'),
                        require.resolve('babel-preset-react')
                    ],
                    plugins: [
                        require.resolve('babel-plugin-transform-class-properties'),
                        require.resolve('babel-plugin-syntax-async-functions'),
                        require.resolve('babel-plugin-transform-regenerator'),
                        require.resolve('babel-plugin-transform-object-rest-spread')
                    ]
                }
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.png$/, loader: "url-loader?limit=100000"
            },
            {
                test: /\.jpg$/, loader: "file-loader"
            }
        ]
    },
    plugins: [
        new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en|nl)$/),
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor'],
            filename: "[name].js"
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        })
    ]
}

options.target = webpackTargetElectronRenderer(options)

module.exports = options
