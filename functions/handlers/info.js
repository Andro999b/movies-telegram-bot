const AWS = require('aws-sdk')
const providersService = require('../providers')
const makeResponse = require('../utils/makeResponse')

const documentClient = new AWS.DynamoDB.DocumentClient()
const TTL = 48 * 3600
const expirationTime = 1 * 3600

async function putToCache(id, result) {
    if(result.files && result.files.length > 0) {
        const ttl = Math.floor(new Date().getTime() / 1000) + TTL
        const expired = Math.floor(new Date().getTime() / 1000) + expirationTime
        const putRequest = { TableName: process.env.TABLE_NAME, Item: { id, result, ttl, expired } }
        await documentClient.put(putRequest).promise() 
    }
}

async function extendExpire(cache) {
    const expired = Math.floor(new Date().getTime() / 1000) + expirationTime
    const putRequest = { TableName: process.env.TABLE_NAME, Item: { ...cache.Item, expired } }
    await documentClient.put(putRequest).promise()
}

module.exports.handler = async (event) => {
    let result = {}

    if (event.pathParameters) {
        const { provider, resultId } = event.pathParameters
        const id = `${provider}:${resultId}`

        const getRequest = { TableName: process.env.TABLE_NAME, Key: { id } }
        const cache = await documentClient.get(getRequest).promise()
        if (cache.Item) {
            if (cache.Item.expired < Date.now() / 1000) { //get new resuls if cahce record expired
                try {
                    result = await providersService.getInfo(provider, resultId)
                    await putToCache(id, result)
                } catch (e) {  // if get resource failed exted cahce expiration time 
                    result = cache.Item.result
                    await extendExpire(cache)
                }
            } else { // get item from cahce if its not expired
                result = cache.Item.result
            } 
        } else { // load item from site if it not in cache
            result = await providersService.getInfo(provider, resultId)
            await putToCache(id, result)
        }
    }

    return makeResponse(result)
}