const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()

const ACCOUNT_ID = process.env.ACCOUNT_ID || '534471691183'
const REGION = process.env.REGION || AWS.config.region

module.exports = (url, method = "get", headers = {}) => new Promise((resolve, reject) => {
    var params = {
        FunctionName: `arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:cloudflare-bypass-prod-proxy`,
        Payload: JSON.stringify({url, method, headers})
    }


    lambda.invoke(params, function (err, data) {
        if (err) reject(err) 
        else resolve(JSON.parse(data.Payload))           
    })
})