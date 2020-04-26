const Cache = require('./Cache')
const { MongoClient, } = require('mongodb');

const COLLECTION_NAME = process.env.TABLE_NAME
const MONGODB_URI = process.env.MONGODB_URI

const expirationTime = 1 * 3600 * 1000

let cachedDb = null;

async function connectToDatabase() {
    if (!cachedDb) {
        const client = await MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
        cachedDb = client.db("test")
    }

    return cachedDb
}

class MongoDBCache extends Cache {

    constructor(db) {
        super()
        this.collection = db.collection(COLLECTION_NAME)
    }

    async putToCache(id, result) {
        const expired = new Date(Date.now() + expirationTime)
        await this.collection.updateOne(
            { _id: id },
            { $set: { result, lastModifiedDate: new Date(), expired } },
            { upsert: true }
        )
    }

    async extendExpire(id) {
        const expired = new Date(Date.now() + expirationTime)
        await this.collection.updateOne({ _id: id }, { $set: { expired } })
    }

    async getOrCompute(keys, compute) {
        const id = keys.join(':')

        let result = {}
        const cacheItem = await this.collection.findOne(
            { _id: id },
            { $inc: { hit: 1 } }
        )

        if (cacheItem) {
            if (cacheItem.expired.getTime() < Date.now()) {
                try {
                    result = await compute(keys)

                    if (result.files && result.files.length > 0) { // if results unavaliable taking from cache
                        await this.putToCache(id, result)
                    } else {
                        result = cacheItem.result
                        await this.extendExpire(id)
                    }
                } catch (e) {  // if get resource failed exted cahce expiration time 
                    result = cacheItem.result
                    await this.extendExpire(id)
                }
            } else {
                result = cacheItem.result
            }
        } else {
            result = await compute(keys)
            await this.putToCache(id, result)
        }

        return result
    }
}

module.exports = async () => {
    const db = await connectToDatabase()
    return new MongoDBCache(db)
}