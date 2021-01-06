const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path')

module.exports = {
    entry: path.join(__dirname, 'src', 'index'),
    output: {
        filename: '[name].bundle.js',
        path: path.join(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: ['babel-loader']
            },
            {
                test: /\.(jpe?g|png)(\?[a-z0-9=&.]+)?$/,
                use: 'base64-inline-loader?limit=1000&name=[name].[ext]'
            },
            {
                test: /\.s?css$/,
                use: [
                    'style-loader', // creates style nodes from JS strings
                    'css-loader', // translates CSS into CommonJS
                    'sass-loader' // compiles Sass to CSS
                ]
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.join(__dirname, 'src', 'index.html'),
            favicon: path.join(__dirname, 'src', 'favicon.ico')
        }),
        new CopyPlugin({
            patterns: [
                { from: path.join('src', 'images', 'help'), to: path.join('images', 'help') },
                { from: path.join('src', 'watch.html'), to: 'watch.html' },
            ]
        })
    ]
}