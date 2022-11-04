import AWS from 'aws-sdk'
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' })

export default { dynamodb }