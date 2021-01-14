const { dynamodb } = require('../db/dynamodb')
const { DateTime } = require('luxon')

const COLLECTION_NAME = process.env.RATING_TABLE
const ANIME_PROVIDERS = new Set(process.env.ANIME_PROVIDERS.split(','))
const TTL = process.env.ANALYTIC_RETENTION || 90

async function recordPlaylistLoad({ id, provider, title }) {
    const dateTime = DateTime.utc()
    const month = `${dateTime.year}-${dateTime.month}`
    const docId = `${month}#${provider}#${id}`
    const bot = ANIME_PROVIDERS.has(provider) ? 'anime' : 'films'
    const bucket = `${month}#${bot}`

    const ttl = dateTime
        .set({ millisecond: 0, second: 0 , minute: 0, hour: 0, day: 1})
        .plus({ days: TTL})
        .toMillis()

    await new Promise((resolve) => {
        dynamodb.updateItem(
            {
                TableName: COLLECTION_NAME,
                Key: { 'id': { 'S': docId } },
                UpdateExpression: 'SET  #bucket = :bucket, #provider = :provider, #month = :month, #title = :title, #ttl = :ttl ADD #count :count',
                ExpressionAttributeNames: {
                    '#month': 'month',
                    '#bucket': 'bucket',
                    '#count': 'count',
                    '#provider': 'provider',
                    '#title': 'title',
                    '#ttl': 'ttl'
                },
                ExpressionAttributeValues: {
                    ':month': { 'S': month },
                    ':bucket': { 'S': bucket },
                    ':provider': { 'S': provider },
                    ':title': { 'S': title },
                    ':count': { 'N': "1" },
                    ':ttl': { 'N': `${ttl}` },
                }
            },
            (err) => {
                if (err) console.error("Fail to count playlist watch", err)
                resolve()
            }
        )
    })
}

module.exports = { recordPlaylistLoad }