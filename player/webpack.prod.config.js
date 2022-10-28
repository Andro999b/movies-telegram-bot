const webpackConfig = require('./webpack.config')
const CopyPlugin = require("copy-webpack-plugin");
const ESLintPlugin = require('eslint-webpack-plugin')
const { merge } = require('webpack-merge')

module.exports = merge(webpackConfig, {
    plugins: [
        new CopyPlugin({
            patterns: [{ from: "public" }]
        }),
        new ESLintPlugin()
    ]
})