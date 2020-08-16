import { periods, TABLE_NAME } from '../constants'
import {
    getDateFor,
    getIndexForPeriod,
    getMonthFor,
    runQuery
} from '../database/dynamodb'
import { 
    range, 
    segmentBucketReducer,  
    uniqueBucketReducer,
    bucketReducer,
    toChartData,
    toPieData,
    getBucketKeys
} from '../utils'
import moment from 'moment'
import { observable } from 'mobx'

const getKeysForPeriod = (period) => {
    switch (period) {
        case 'today': return [{ key: 'date', value: getDateFor(0) }]
        case 'yesterday': return [{ key: 'date', value: getDateFor(1) }]
        case 'last7days': return range(7)
            .map((i) => ({ key: 'date', value: getDateFor(i - 1) }))
            .reverse()
        case 'current_month': return [{ key: 'month', value: getMonthFor(0) }]
        case 'previous_month': return [{ key: 'month', value: getMonthFor(-1) }]
        case 'last3months': return range(3)
            .map((i) => ({ key: 'month', value: getMonthFor(i - 1) }))
            .reverse()
    }
}

const processPeriod = (period, reducer, initValue = {}) => {
    let accumulator = initValue

    const index = getIndexForPeriod(period)

    const queries = getKeysForPeriod(period)
        .map(({ key, value }) => {
            const query = {
                TableName: TABLE_NAME,
                KeyConditions: {
                    [key]: {
                        ComparisonOperator: 'EQ',
                        AttributeValueList: [value]
                    }
                },

            }

            if (index) query['IndexName'] = index

            return query
        })


    const runQueries = (queries) =>
        Promise
            .all(queries.map(runQuery))
            .then((results) => {
                const newQueries = []

                results.forEach(({ items, query, lastKey }) => {
                    items.forEach((item) => { accumulator = reducer(accumulator, item) })
                    if (lastKey) {
                        newQueries.push({ ...query, ExclusiveStartKey: lastKey })
                    }
                })

                if (newQueries.length > 0)
                    return runQueries(newQueries)

                return accumulator
            })

    return runQueries(queries)
}

const topUsersBucketReducer = (acc, item) => {
    if (!acc.hasOwnProperty(item.uid)) {
        acc[item.uid] = {
            value: 0,
            item
        }
    }

    acc[item.uid].value++
    return acc
}

const getSegmetExtractorForPeriod = (period) => {
    if (period == 'today' || period == 'yesterday')
        return ({ time }) => moment(time).format('HH:00')

    return ({ date }) => date
}

const toUserActivityData = (bucket) =>
    Object
        .keys(bucket)
        .map((key) => ({
            seg: key,
            users: bucket[key].size
        }))

const toTopUsersPie = (bucket) =>
    Object
        .keys(bucket)
        .map((key) => bucket[key])
        .sort((a, b) => b.value - a.value)

const periodsCache = {}

export default observable({
    loading: true,

    usersChart: [],
    topUsers: [],

    botPie: [],
    botChart: [],
    bots: [],

    eventsPie: [],
    eventsChart: [],
    events: [],

    period: periods[0],

    load(period) {
        this.period = period
        this.reload()
    },

    reload(force) {
        const period = this.period

        const segmentExtractor = getSegmetExtractorForPeriod(this.period)

        const eventsReducer = segmentBucketReducer(segmentExtractor, ({ type }) => type)
        const eventsCounterReducer = bucketReducer(({ type }) => type)
        const botsReducer = segmentBucketReducer(segmentExtractor, ({ bot }) => bot)
        const botsCounterReducer = bucketReducer(({ bot }) => bot)
        const usersReducer = uniqueBucketReducer(segmentExtractor, ({ uid }) => uid)

        const updateCharts = ({
            eventsBucket,
            eventsCountBucket,
            botsBucket,
            botsCountBucket,
            usersBucket,
            topUsersBucket
        }) => {
            if (this.period != period) return

            this.eventsChart = toChartData(eventsBucket)
            this.eventsPie = toPieData(eventsCountBucket)
            this.events = getBucketKeys(eventsCountBucket)

            this.botChart = toChartData(botsBucket)
            this.botPie = toPieData(botsCountBucket)
            this.bots = getBucketKeys(botsCountBucket)

            this.usersChart = toUserActivityData(usersBucket)
            this.topUsers = toTopUsersPie(topUsersBucket)

            this.loading = false
        }

        if (!force && periodsCache.hasOwnProperty(period)) {
            updateCharts(periodsCache[period])
            return
        }

        this.loading = true

        processPeriod(
            period,
            (acc, item) => {
                eventsReducer(acc.eventsBucket, item)
                eventsCounterReducer(acc.eventsCountBucket, item)
                botsReducer(acc.botsBucket, item)
                botsCounterReducer(acc.botsCountBucket, item)
                usersReducer(acc.usersBucket, item)
                topUsersBucketReducer(acc.topUsersBucket, item)
                return acc
            },
            {
                eventsBucket: {},
                eventsCountBucket: {},
                botsBucket: {},
                botsCountBucket: {},
                usersBucket: {},
                topUsersBucket: {}
            })
            .then((acc) => {
                periodsCache[period] = acc
                updateCharts(acc)
            })
    }
})