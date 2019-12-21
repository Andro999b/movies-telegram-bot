const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path')

module.exports = {
    entry: path.join(__dirname, 'src', 'index'),
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js',
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
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: ['file-loader']
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
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                },
            }
        }
    },
    performance: {
        maxEntrypointSize: 300000,
        assetFilter: function (assetFilename) {
            return !assetFilename.endsWith('.js')
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'index.html'),
            favicon: path.join(__dirname, 'src', 'favicon.ico')
        }),
        new CopyPlugin([
            { from: '.well-known', to: '.well-known' },
        ])
    ]
}