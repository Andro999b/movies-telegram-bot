import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import webpack from 'webpack'

const releaseDate = new Date()
const releaseYaer = releaseDate.getFullYear()
const releaseDay = Math.floor((releaseDate - new Date(releaseDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
const releaseHour = releaseDate.getHours()

export default {
  entry: path.resolve('./src/index.ts'),
  output: {
    filename: '[name].bundle.js',
    path: path.resolve('./dist')
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
      template: path.resolve('./src/index.html')
    })
  ]
}
