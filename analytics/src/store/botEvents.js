import { observable } from 'mobx'
import { runQuery } from '../database/dynamodb'
import { TABLE_NAME, EVENTS_UPDATE_INTERVAL } from '../constants'
import { isToday } from '../utils'
import periodStore from './periodStore'

let loading = false
let interval = null

export default observable({
    error: null,
    events: [],
    lastTs: null,
    initialized: false,

    startUpdate() {
        if (interval) clearInterval(interval)
        interval = setInterval(
            () => {
                if (isToday(periodStore.date)) this.loadStratingFromTS(this.lastTs)
            },
            EVENTS_UPDATE_INTERVAL
        )
    },

    stopUpdate() {
        if (interval) clearInterval(interval)
    },

    loadStratingFromTS(ts) {
        if (loading) return
        loading = true

        const keyValue = periodStore.getFormatedDate()

        const query = ts ?
            {
                TableName: TABLE_NAME,
                KeyConditionExpression: '#key = :value AND #range > :ts',
                ExpressionAttributeNames: {
                    '#key': 'date',
                    '#range': 'time'
                },
                ExpressionAttributeValues: {
                    ':value': keyValue,
                    ':ts': ts
                }
            } :
            {
                TableName: TABLE_NAME,
                KeyConditionExpression: '#key = :value',
                ExpressionAttributeNames: {
                    '#key': 'date'
                },
                ExpressionAttributeValues: {
                    ':value': keyValue
                }
            }


        this.error = null

        runQuery(query)
            .then(({ items }) => {
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
                    .reverse()
                    .concat(this.events)
                this.lastTs = Date.now()
            })
            .catch((error) => this.error = error.message)

    },

    setDate(date) {
        periodStore.setDate(date)
        this.reload()
    },

    reload() {
        this.initialized = false
        this.events = []
        this.loadStratingFromTS(null)
    },

    init() {
        this.reload()
        this.startUpdate()

        return () => this.stopUpdate()
    }
})