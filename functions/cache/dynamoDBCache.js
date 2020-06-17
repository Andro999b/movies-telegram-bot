const Cache = require('./Cache')

const AWS = require('aws-sdk')

const TTL = 48 * 3600
const expirationTime = 1 * 3600

class DynamoDBCache extends Cache {
    
    constructor(documentClient) {
        super()
        this.documentClient = documentClient
    }
    
    async putToCache(id, result) {
        const ttl = Math.floor(Date.now() / 1000) + TTL
        const expired = Math.floor(Date.now() / 1000) + expirationTime
        const putRequest = { TableName: process.env.TABLE_NAME, Item: { id, result, ttl, expired } }
        await this.documentClient.put(putRequest).promise() 
    }
    
    async extendExpire(cache) {
        const expired = Math.floor( Date.now() / 1000) + expirationTime
        const putRequest = { TableName: process.env.TABLE_NAME, Item: { ...cache.Item, expired } }
        await this.documentClient.put(putRequest).promise()
    }

    async getOrCompute(keys, compute) {
        const id = keys.join(':')
        const getRequest = { TableName: process.env.TABLE_NAME, Key: { id } }
        
        let result = {}
        const cache = await this.documentClient.get(getRequest).promise()

        if (cache.Item) {
            if (cache.Item.expired < Date.now() / 1000) { //get new resuls if cahce record expired
                try {
                    if (result.files && result.files.length > 0) { // if results unavaliable taking from cache
                        await this.putToCache(id, result)
                    } else {
                        result = cacheItem.result
                        await this.extendExpire(id)
                    }
                } catch (e) {  // if get resource failed exted cahce expiration time 
                    result = cache.Item.result
                    await this.extendExpire(cache)
                }
            } else { // get item from cahce if its not expired
                result = cache.Item.result
            } 
        } else { // load item from site if it not in cache
            result = await compute(keys)
            if (result.files && result.files.length > 0) {
                await this.putToCache(id, result)
            }
        }

        return result
    }
}

module.exports = async () => new DynamoDBCache(new AWS.DynamoDB.DocumentClient())