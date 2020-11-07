import { COLLECTION_NAME, connectToDatabase } from './db/mongo'

async function runAggregation(pipline) {
    const client = await connectToDatabase()
    return await new Promise((resolve, reject) => {
        client.collection(COLLECTION_NAME).aggregate(pipline, (err, cursor) => {
            if (err) reject(err)
            else cursor.toArray((err, documents) => {
                if (err) reject(err)
                else resolve(documents)
            })
        })
    })
}

async function getTopWatchedProviders() {
    const result = await runAggregation([
        {
            '$group': {
                '_id': '$result.provider',
                'count': {
                    '$sum': "$hit"
                }
            }
        },
        {
            '$sort': {
                'count': -1
            }
        }
    ])

    return { key: 'providersHits', result }
}

async function getTopCachedProviders() {
    const result = await runAggregation([
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
    ])

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

async function getRecientWatches() {
    const client = await connectToDatabase()
    const result = await client.collection(COLLECTION_NAME)
        .find(
            {},
            {
                'sort': { 'lastModifiedDate': -1 },
                'limit': 100,
                'projection': { 'lastModifiedDate': 1, 'result.provider': 1, 'result.title': 1 }
            }
        )
        .toArray()

    return { key: 'recient', result }
}

module.exports.handler = async () => {
    const results = await Promise.all([
        getTopCachedProviders(), 
        getTopWatchedProviders(), 
        getTopWatches(), 
        getRecientWatches()
    ])
    return results.reduce((acc, { key, result }) => ({ ...acc, [key]: result }), {})
}