const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

const releaseDate = new Date()
const releaseYaer = releaseDate.getFullYear()
const releaseDay = Math.floor((releaseDate - new Date(releaseDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
const releaseHour = releaseDate.getHours()

module.exports = {
    entry: path.join(__dirname, 'src', 'index'),
    output: {
        filename: '[name].bundle.js',
        path: path.join(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'ts-loader'
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
        extensions: ['*', '.js', '.jsx', '.ts', '.tsx']
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    devtool: 'source-map',
    plugins: [
        new webpack.EnvironmentPlugin({
            RELEASE: `movies-player@${releaseHour}.${releaseDay}.${releaseYaer}`
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.join(__dirname, 'src', 'index.html')
        })
    ]
}