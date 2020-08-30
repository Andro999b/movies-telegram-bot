import { runQuery } from '../database/dynamodb'
import { TABLE_NAME } from '../constants'
import { bucketReducer, getUserName } from '../utils'

export default () => ({
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
            KeyConditions: {
                uid: {
                    ComparisonOperator: 'EQ',
                    AttributeValueList: [parseInt(uid)]
                }
            },
            ScanIndexForward: false,
            Limit: 100
        }

        const eventsReducer = bucketReducer(({ type }) => type)
        const botsReducer = bucketReducer(({ bot }) => bot)

        runQuery(query).then(({ items }) => {
            this.events = items
            this.eventsPie = items.reduce(eventsReducer, {}).chartData
            this.botsPie = items.reduce(botsReducer, {}).chartData
            this.loading = false

            if(items.length)
                this.name = getUserName(items[0])
        })
    }
})