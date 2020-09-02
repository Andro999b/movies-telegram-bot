import '../aws-sdk'
import { PERIODS, TABLE_NAME, REGION } from '../constants'
import { getDateFor, getIndexForPeriod, getMonthFor, runQuery } from '../database/dynamodb'
import { range, segmentBucketReducer, uniqueBucketReducer, bucketReducer } from '../utils'
import registerWebworker from 'webworker-promise/lib/register'
import moment from 'moment'

const getKeysForPeriod = (period) => {
    switch (period) {
        case 'last7days': return range(7)
            .map((i) => ({ key: 'date', value: getDateFor(i - 1) }))
            .reverse()
        case 'last30days': return range(30)
            .map((i) => ({ key: 'date', value: getDateFor(i - 1) }))
            .reverse()
        case 'current_month': return [{ key: 'month', value: getMonthFor(0) }]
        case 'previous_month': return [{ key: 'month', value: getMonthFor(1) }]
        case 'last3months': return range(3)
            .map((i) => ({ key: 'month', value: getMonthFor(i - 1) }))
            .reverse()
        default: return [{ key: 'date', value: period }]
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
                    items.forEach((item) => accumulator = reducer(accumulator, item))
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
    if (!acc[item.uid]) {
        acc[item.uid] = {
            value: 0,
            item
        }
    }

    acc[item.uid].value++
    return acc
}

const getSegmetExtractorForPeriod = (period) => {
    if (PERIODS.includes(period))
        return ({ date }) => date

    return ({ time }) => moment(time).format('HH:00')
}

registerWebworker(({ period, credentials }) => {
    AWS.config.region = REGION
    AWS.config.credentials = new AWS.CognitoIdentityCredentials(credentials)

    const segmentExtractor = getSegmetExtractorForPeriod(period)

    const eventsReducer = segmentBucketReducer(segmentExtractor, ({ type }) => type)
    const eventsCounterReducer = bucketReducer(({ type }) => type)
    const botsReducer = segmentBucketReducer(segmentExtractor, ({ bot }) => bot)
    const botsCounterReducer = bucketReducer(({ bot }) => bot)
    const usersReducer = uniqueBucketReducer(segmentExtractor, ({ uid }) => uid)

    return processPeriod(
        period,
        (acc, item) => {
            acc.eventsBucket = eventsReducer(acc.eventsBucket, item)
            acc.eventsCountBucket = eventsCounterReducer(acc.eventsCountBucket, item)
            acc.botsBucket = botsReducer(acc.botsBucket, item)
            acc.botsCountBucket = botsCounterReducer(acc.botsCountBucket, item)
            acc.usersBucket = usersReducer(acc.usersBucket, item)
            acc.topUsersBucket = topUsersBucketReducer(acc.topUsersBucket, item)
            return acc
        },
        {
            eventsBucket: {},
            eventsCountBucket: {},
            botsBucket: {},
            botsCountBucket: {},
            usersBucket: {},
            topUsersBucket: {}
        }
    )
})