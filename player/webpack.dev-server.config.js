const webpackConfig = require('./webpack.config')
const bodyParser = require('body-parser')
const { merge } = require('webpack-merge')

module.exports = merge(webpackConfig, {
    mode: 'development',
    devtool: 'eval',
    devServer: {
        port: 3000,
        host: '0.0.0.0',
        setupMiddlewares: (middlewares, devServer) => {
            devServer.app.use(bodyParser.text())
            devServer.app.post('/log', function (req, res) {
                console.log("client error", JSON.parse(req.body))
                res.send("ok")
            });
            return middlewares
        }
    }
})