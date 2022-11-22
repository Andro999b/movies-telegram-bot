import { GenerateSW } from 'workbox-webpack-plugin'
import WebpackPwaManifest from 'webpack-pwa-manifest'
import webpackConfig from './webpack.config'
import { merge } from 'webpack-merge'
import path from 'path'

export default merge(webpackConfig, {
  plugins: [
    new WebpackPwaManifest({
      name: 'Movie Bot Analytics',
      short_name: 'Movie Bot Analytics',
      display: 'fullscreen',
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
