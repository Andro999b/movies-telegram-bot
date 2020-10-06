const Cache = require('./Cache')
const { MongoClient } = require('mongodb')

const COLLECTION_NAME = process.env.CACHE_TABLE
const MONGODB_URI = process.env.MONGODB_URI

const expirationTime = (process.env.CACHE_TTL || 3600) * 1000

let cachedDb = null

async function connectToDatabase() {
    if (!cachedDb) {
        const client = await MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
        cachedDb = client.db('test')
    }

    return cachedDb
}

class MongoDBCache extends Cache {

    constructor(name, db) {
        super()
        this.collection = db.collection(`${COLLECTION_NAME}-${name}`)
    }

    async putToCache(id, result) {
        const expired = new Date(Date.now() + expirationTime)
        await this.collection.updateOne(
            { _id: id },
            { $set: { result, lastModifiedDate: new Date(), expired }, $inc: { hit: 1 } },
            { upsert: true }
        )
    }

    async putToCacheMultiple(results) {
        const expired = new Date(Date.now() + expirationTime)

        await this.collection.bulkWrite(results.map(({ result }) => ({
            updateOne: {
                filter: { _id: result.id },
                update: { $set: { result, lastModifiedDate: new Date(), expired }, $inc: { hit: 1 } },
                upsert: true 
            }
        })))
    }

    async get(id) {
        return (await this.collection.findOneAndUpdate(
            { _id: id },
            { $inc: { hit: 1 } }
        )).value
    }


    async extendExpire(id) {
        const expired = new Date(Date.now() + expirationTime)
        await this.collection.updateOne({ _id: id }, { $set: { expired } })
    }

    async getOrCompute(keys, compute, isEmpty = () => false) {
        const id = keys.join(':')

        let result = {}
        const cacheItem = await this.get(id)

        if (cacheItem) {
            if (cacheItem.expired.getTime() < Date.now()) {
                try {
                    result = await compute(keys)

                    if (!isEmpty(result)) { // if results unavaliable taking from cache
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
            if (!isEmpty(result)) {
                await this.putToCache(id, result)
            }
        }

        return result
    }
}

module.exports = async (name) => {
    const db = await connectToDatabase()
    return new MongoDBCache(name, db)
}