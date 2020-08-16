import { runQuery } from '../database/dynamodb'
import { TABLE_NAME } from '../constants'
import { bucketReducer, toPieData } from '../utils'

export default () => ({
    loading: true,
    botsPie: [],
    eventsPie: [],
    events: [],

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
            ScanIndexForward: false
        }

        const eventsReducer = bucketReducer(({ type }) => type)
        const botsReducer = bucketReducer(({ bot }) => bot)

        runQuery(query).then(({ items }) => {
            this.events = items
            this.eventsPie = toPieData(items.reduce(eventsReducer, {}))
            this.botsPie = toPieData(items.reduce(botsReducer, {}))
            this.loading = false
        })
    }
})