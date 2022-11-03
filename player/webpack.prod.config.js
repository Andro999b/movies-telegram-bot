import webpackConfig from './webpack.config.js'
import CopyPlugin from "copy-webpack-plugin"
import ESLintPlugin from 'eslint-webpack-plugin'
import { merge } from 'webpack-merge'

export default merge(webpackConfig, {
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "public" }]
    }),
    new ESLintPlugin()
  ]
})
