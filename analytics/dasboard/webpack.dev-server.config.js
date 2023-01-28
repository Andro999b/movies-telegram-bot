import webpackConfig from './webpack.config.js'
import { merge } from 'webpack-merge'

export default merge(webpackConfig, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  devServer: {
    port: 3000,
    host: '0.0.0.0'
  }
})
