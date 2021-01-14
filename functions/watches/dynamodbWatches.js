const { dynamodb } = require('../db/dynamodb')
const { DateTime } = require('luxon')

const COLLECTION_NAME = process.env.RATING_TABLE
const ANIME_PROVIDERS = new Set(process.env.ANIME_PROVIDERS.split(','))

async function recordPlaylistLoad({ id, provider, title }) {
    const dateTime = DateTime.utc()
    const month = `${dateTime.year}-${dateTime.month}`
    const docId = `${month}#${provider}#${id}`
    const bot = ANIME_PROVIDERS.has(provider) ? 'anime' : 'films'
    const bucket = `${month}#${bot}`

    await new Promise((resolve) => {
        dynamodb.updateItem(
            {
                TableName: COLLECTION_NAME,
                Key: { 'id': { 'S': docId } },
                UpdateExpression: 'SET #month = :month, #bucket = :bucket, #title = :title, #provider = :provider ADD #count :count',
                ExpressionAttributeNames: {
                    '#month': 'month',
                    '#bucket': 'bucket',
                    '#count': 'count',
                    '#provider': 'provider',
                    '#title': 'title',
                },
                ExpressionAttributeValues: {
                    ':month': { 'S': month },
                    ':bucket': { 'S': bucket },
                    ':provider': { 'S': provider },
                    ':title': { 'S': title },
                    ':count': { 'N': "1" }
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