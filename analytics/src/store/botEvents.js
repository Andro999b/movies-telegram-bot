import { observable } from 'mobx'
import { runQuery } from '../database/dynamodb'
import moment from 'moment'
import { TABLE_NAME, EVENTS_UPDATE_INTERVAL } from '../constants'

let loading = false
let interval = null

export default observable({
    events: [],
    lastTs: null,
    initialized: false,

    startUpdate() {
        if (interval) clearInterval(interval)
        interval = setInterval(
            () => this.loadStratingFromTS(this.lastTs),
            EVENTS_UPDATE_INTERVAL
        )
    },

    stopUpdate() {
        if (interval) clearInterval(interval)
    },

    loadStratingFromTS(ts) {
        if (loading) return
        loading = true

        const keyValue = moment().utc().format('YYYY-M-D')

        const query = {
            TableName: TABLE_NAME,
            KeyConditions: {
                date: {
                    ComparisonOperator: 'EQ',
                    AttributeValueList: [keyValue]
                }
            },
            ScanIndexForward: false
        }

        if (ts) {
            query.KeyConditions['time'] = {
                ComparisonOperator: 'GT',
                AttributeValueList: [ts]
            }
        }

        runQuery(query).then(({ items }) => {
            loading = false
            this.initialized = true
            this.events = items
                .map((item) => {
                    item.filter = [
                        item.type,
                        item.username, 
                        item.firstname, 
                        item.lastname,
                        item.bot
                    ].join(' ')
                    return item
                })
                .concat(this.events)
            this.lastTs = Date.now()
        })
    },

    reload() {
        this.initialized = false
        this.events = []
        this.loadStratingFromTS(null)
    }
})