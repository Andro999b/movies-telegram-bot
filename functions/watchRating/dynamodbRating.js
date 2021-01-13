const { dynamodb } = require('../db/dynamodb')
const { DateTime } = require('luxon')

const COLLECTION_NAME = process.env.RATING_TABLE

async function recordPlaylistLoad({ id, provider, title }) {
    const dateTime = DateTime.utc()
    const month = `${dateTime.year}-${dateTime.month}`
    const docId = `${month}#${provider}#${id}`


    dynamodb.updateItem(
        {
            TableName: COLLECTION_NAME,
            Key: { 'id': { 'S': docId } },
            UpdateExpression: 'SET #month = :month, #title = :title, #provider = :provider ADD #count :count',
            ExpressionAttributeNames: {
                '#month': 'month',
                '#count': 'count',
                '#provider': 'provider',
                '#title': 'title',
            },
            ExpressionAttributeValues: {
                ':month': { 'S': month },
                ':provider': { 'S': provider },
                ':title': { 'S': title },
                ':count': { 'N': "1" }
            }
        },
        (err) => {
            if (err) console.error("Fail to count playlist watch", err)
        }
    )
    
}

module.exports = { recordPlaylistLoad }