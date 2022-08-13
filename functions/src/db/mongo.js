const { MongoClient } = require('mongodb')
const MONGODB_URI = process.env.MONGODB_URI

let cachedDb = null

async function connectToDatabase() {
    if (!cachedDb) {
        const client = await MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
        cachedDb = client.db('test')
    }

    return cachedDb
}


module.exports = { connectToDatabase }