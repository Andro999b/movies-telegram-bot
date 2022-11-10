import { Document } from 'mongodb';
import { COLLECTION_NAME, connectToDatabase } from './db/mongo.js';

const runAggregation = async (pipline: Document[]) => {
    const client = await connectToDatabase()
    const aggCursor = client.collection(COLLECTION_NAME).aggregate(pipline)
    const docs = []

    for await (const doc of aggCursor) {
        docs.push(doc);
    }

    return docs
}

const getTopWatchedProviders = async () => {
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

const getTopCachedProviders = async () => {
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

const getTopWatches = async () => {
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

const getRecientWatches = async () => {
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

export const handler = async () => {
    const results = await Promise.all([
        getTopCachedProviders(),
        getTopWatchedProviders(),
        getTopWatches(),
        getRecientWatches()
    ])
    return results.reduce((acc, { key, result }) => ({ ...acc, [key]: result }), {})
}