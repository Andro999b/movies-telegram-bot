const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' })

module.exports = { dynamodb }