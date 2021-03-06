import { runQuery } from '../database/dynamodb'
import { TABLE_NAME } from '../constants'
import { bucketReducer, getUserName } from '../utils'

export default () => ({
    error: null,
    loading: true,
    botsPie: [],
    eventsPie: [],
    events: [],
    name: null,

    load(uid) {
        this.botPie = []
        this.eventsPie = []

        const query = {
            TableName: TABLE_NAME,
            IndexName: 'userIdx',
            KeyConditionExpression: `#key = :value`,
            ExpressionAttributeNames: {
                '#key': 'uid'
            },
            ExpressionAttributeValues: {
                ':value': parseInt(uid)
            },
            ScanIndexForward: false,
            Limit: 100
        }

        const eventsReducer = bucketReducer(({ type }) => type)
        const botsReducer = bucketReducer(({ bot }) => bot)

        this.error = null

        runQuery(query)
            .then(({ items }) => {
                this.events = items
                this.eventsPie = items.reduce(eventsReducer, {}).chartData
                this.botsPie = items.reduce(botsReducer, {}).chartData
                this.loading = false

                if (items.length)
                    this.name = getUserName(items[0])
            })
            .catch((error) => this.error = error.message)
    }
})