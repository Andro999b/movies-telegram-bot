const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()

const ACCOUNT_ID = process.env.ACCOUNT_ID
const REGION = process.env.REGION || AWS.config.region
module.exports = (url, method = 'get', headers = {}, body = null) => new Promise((resolve, reject) => {
    var params = {
        FunctionName: `arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:cloudflare-bypass-prod-proxy`,
        // FunctionName: `arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:cloudflare-bypass-dev-proxy`,
        Payload: JSON.stringify({url, method, headers, body})
    }

    lambda.invoke(params, function (err, data) {
        if (err) reject(err) 
        else resolve(JSON.parse(data.Payload))           
    })
})