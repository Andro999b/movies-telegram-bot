const AWS = require('aws-sdk')
const providersService = require('../providers')
const makeResponse = require('../utils/makeResponse')

const documentClient = new AWS.DynamoDB.DocumentClient()
const TTL = 12 * 3600

module.exports = async (event) => {
    let result = {}

    if(event.pathParameters) {
        const { provider, resultId } = event.pathParameters
        const id = `${provider}:${resultId}`

        const getRequest = { TableName: process.env.TABLE_NAME, Key: { id } }
        const cache = await documentClient.get(getRequest).promise()
        if(cache.Item) {
            result = cache.Item.result
        } else {
            result = await providersService.getInfo(provider, resultId)

            const ttl = new Date().getTime() + TTL
            const putRequest = { TableName: process.env.TABLE_NAME, Item: { id, result, ttl } }
            await documentClient.put(putRequest).promise()
        }
    }

    return makeResponse(result)
}