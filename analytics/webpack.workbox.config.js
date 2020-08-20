const { GenerateSW } = require('workbox-webpack-plugin')
const WebpackPwaManifest = require('webpack-pwa-manifest')
const webpackConfig = require('./webpack.config')
const { merge } = require('webpack-merge')
const path = require('path')

module.exports = merge(webpackConfig, {
    plugins: [
        new WebpackPwaManifest({
            name: 'Movie Bot Analytics',
            short_name: 'Movie Bot Analytics',
            background_color: '#ffffff',
            orientation: 'landscape',
            crossorigin: 'use-credentials', //can be null, use-credentials or anonymous
            icons: [
                {
                    src: path.resolve('src/logo.png'),
                    sizes: [96, 128, 192, 256, 384, 512] // multiple sizes
                }
            ]
        }),
        new GenerateSW()
    ]
})