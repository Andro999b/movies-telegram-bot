const Cache = require('./Cache')
const MongoClient = require('mongodb').MongoClient;

const COLLECTION_NAME = process.env.TABLE_NAME
const MONGODB_URI = process.env.MONGODB_URI

const TTL = 48 * 3600
const expirationTime = 1 * 3600

let cachedDb = null;

async function connectToDatabase() {
    if (!cachedDb) {
        const client = await MongoClient.connect(MONGODB_URI)
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
        if (result.files && result.files.length > 0) {
            const ttl = Math.floor(new Date().getTime() / 1000) + TTL
            const expired = Math.floor(new Date().getTime() / 1000) + expirationTime

            await this.collection.updateOne(
                { id },
                { $set: { result, ttl, expired } },
                { upsert: true }
            )
        }
    }

    async extendExpire(id) {
        const expired = Math.floor(new Date().getTime() / 1000) + expirationTime
        await this.collection.updateOne({ id }, { $set: { expired } })
    }

    async getOrCompute(keys, compute) {
        const id = keys.join(':')

        let result = {}
        const cacheItem = await this.collection.findOne({ _id: id })

        if (cacheItem) {
            if (cacheItem.expired < Date.now() / 1000) {
                try {
                    result = await compute(keys)
                    await this.putToCache(id, result)
                } catch (e) {  // if get resource failed exted cahce expiration time 
                    result = cacheItem.result
                    await this.extendExpire(id)
                }
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