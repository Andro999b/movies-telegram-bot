const { MongoClient } = require('mongodb')

let cachedDb = null

export const COLLECTION_NAME = process.env.CACHE_TABLE
const MONGODB_URI = process.env.MONGODB_URI

export async function connectToDatabase() {
    if (!cachedDb) {
        const client = await MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
        cachedDb = client.db('test')
    }

    return cachedDb
}