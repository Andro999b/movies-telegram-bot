const webpackConfig = require('./webpack.config')
const bodyParser = require('body-parser')
const merge = require('webpack-merge')

module.exports = merge(webpackConfig, {
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    watch: true,
    devServer: {
        port: 3000,
        host: '0.0.0.0',
        before: function(app, server, compiler) {
            app.use(bodyParser.text())
            app.post('/log', function(req, res) {
              console.log("client error", JSON.parse(req.body))
              res.send("ok")
            });
        } 
    }
})