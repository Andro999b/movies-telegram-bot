import { Db, MongoClient } from 'mongodb'

let cachedDb: Db | null = null

export const COLLECTION_NAME = process.env.CACHE_TABLE
const MONGODB_URI = process.env.MONGODB_URI

export const connectToDatabase = async () => {
    if (!cachedDb) {
        const client = await MongoClient.connect(MONGODB_URI)
        cachedDb = client.db('test')
    }

    return cachedDb
}