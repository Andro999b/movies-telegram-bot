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
            filename: 'watch.html',
            template: path.join(__dirname, 'src', 'watch.html'),
            favicon: path.join(__dirname, 'src', 'favicon.ico')
        }),
        new HtmlWebpackPlugin({
            filename: 'mobile.html',
            template: path.join(__dirname, 'src', 'mobile.html')
        }),
        new CopyPlugin([
            'src/index.html',
            { from: '.well-known', to: '.well-known' },
            { from: path.join('src', 'images', 'help'), to: path.join('images', 'help') }
        ])
    ]
}