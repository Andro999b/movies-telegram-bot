const webpackConfig = require('./webpack.config')
const { merge } = require('webpack-merge')

module.exports = merge(webpackConfig, {
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    watch: true,
    devServer: {
        port: 8080,
        host: '0.0.0.0'
    }
})