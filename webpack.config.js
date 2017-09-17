var path = require('path')
var webpack = require('webpack')

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
        app: './src/index.jsx'
    },
    target: 'electron-renderer',
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        modules: [
          path.resolve(__dirname) + '/src',
          'node_modules'
        ],
        extensions: ['.webpack.js', '.web.js', '.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: require.resolve('babel-loader'),
                options: {
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
                use: [
                  "style-loader",
                  "css-loader"
                ]
            },
            {
                test: /\.png$/,
                loader: "url-loader",
                options: {
                  limit: '100000'
                }
            },
            {
                test: /\.jpg$/,
                loader: "file-loader"
            }
        ]
    },
    plugins: [
        new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en|nl)$/),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
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

module.exports = options
