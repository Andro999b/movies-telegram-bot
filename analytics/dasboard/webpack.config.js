import HtmlWebpackPlugin from 'html-webpack-plugin'
import ESLintPlugin from 'eslint-webpack-plugin'
import path from 'path'

export default {
  entry: path.resolve('src/index.ts'),
  output: {
    filename: '[name].bundle.js',
    path: path.resolve('./dist')
  },
  module: {
    rules: [
      {
        test: /\.worker\.ts$/,
        use: ['worker-loader']
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['*', '.ts', '.js', '.tsx']
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins: [
    new ESLintPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve('./src/index.html'),
      favicon: path.resolve('./src/favicon.ico')
    })
  ]
}
