const { MongoClient } = require('mongodb')

let cachedDb = null

const COLLECTION_NAME = process.env.CACHE_TABLE
const MONGODB_URI = process.env.MONGODB_URI

async function connectToDatabase() {
    if (!cachedDb) {
        const client = await MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
        cachedDb = client.db('test')
    }

    return cachedDb
}

async function getTopProviders() {
    const client = await connectToDatabase()
    const result = await new Promise((resolve, reject) => {
        client.collection(COLLECTION_NAME).aggregate([
            {
                '$group': {
                    '_id': '$result.provider',
                    'count': {
                        '$sum': 1
                    }
                }
            },
            {
                '$sort': {
                    'count': -1
                }
            }
        ], (err, cursor) => {
            if (err) reject(err)
            else cursor.toArray((err, documents) => {
                if (err) reject(err)
                else resolve(documents)
            })
        })
    })

    return { key: 'providers', result }
}

async function getTopWatches() {
    const client = await connectToDatabase()
    const result = await client.collection(COLLECTION_NAME)
        .find(
            { 'hit': { '$exists': 1 } },
            {
                'sort': { 'hit': -1 },
                'limit': 100,
                'projection': { 'hit': 1, 'result.provider': 1, 'result.title': 1 }
            }
        )
        .toArray()

    return { key: 'hits', result }
}

module.exports.handler = async () => {
    const results = await Promise.all([getTopProviders(), getTopWatches()])
    return results.reduce((acc, { key, result }) => ({ ...acc, [key]: result }), {})
}