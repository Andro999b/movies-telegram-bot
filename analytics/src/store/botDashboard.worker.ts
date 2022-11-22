import { PERIODS, TABLE_NAME } from '../constants'
import { getDateFor, getIndexForPeriod, getMonthFor, runQuery } from '../database/dynamodb'
import { range, segmentBucketReducer, uniqueBucketReducer, bucketReducer, bucketInitState, toBotEvent } from '../utils'
import { PWBWorker } from 'promise-worker-bi'
import moment from 'moment'
import { BotEvent, Counting, PieData, Unique } from '../types'
import { UsersEventCount, WorkerResult, WorkerRequest } from '../types/worker'
import { QueryCommandInput } from '@aws-sdk/client-dynamodb'

const promiseWorker = new PWBWorker()

interface PeriodKeys {
  key: 'date' | 'month'
  value: string
}

const getKeysForPeriod = (period: string): PeriodKeys[] => {
  switch (period) {
    case 'last7days': return range(7)
      .map((i) => ({ key: 'date', value: getDateFor(i - 1) } as PeriodKeys))
      .reverse()
    case 'last30days': return range(30)
      .map((i) => ({ key: 'date', value: getDateFor(i - 1) } as PeriodKeys))
      .reverse()
    case 'current_month': return [{ key: 'month', value: getMonthFor(0) } as PeriodKeys]
    case 'previous_month': return [{ key: 'month', value: getMonthFor(1) } as PeriodKeys]
    case 'last3months': return range(3)
      .map((i) => ({ key: 'month', value: getMonthFor(i - 1) } as PeriodKeys))
      .reverse()
    default:
      return [{
        key: 'date',
        value: period
      }]
  }
}

type PeriodReducer = (acc: WorkerResult, item: BotEvent) => WorkerResult

const processPeriod = (request: WorkerRequest, reducer: PeriodReducer, initValue: WorkerResult): Promise<WorkerResult> => {
  let accumulator: WorkerResult = initValue

  const index = getIndexForPeriod(request.period)

  const queries = getKeysForPeriod(request.period)
    .map(({ key, value }) => {

      const query: QueryCommandInput = {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#key = :value',
        ExpressionAttributeNames: {
          '#key': key
        },
        ExpressionAttributeValues: {
          ':value': { 'S': value }
        },
        IndexName: index
      }

      return query
    })

  const runQueries = async (queries: QueryCommandInput[]): Promise<WorkerResult> => {
    const results = await Promise.all(queries.map((q) => runQuery(q, request.credentials)))
    const newQueries: QueryCommandInput[] = []

    results.forEach(({ items, query, lastKey }) => {
      items.forEach((item) => accumulator = reducer(accumulator, toBotEvent(item)))
      if (lastKey) {
        newQueries.push({ ...query, ExclusiveStartKey: lastKey })
      }
    })

    if (newQueries.length > 0)
      return runQueries(newQueries)

    return accumulator
  }

  return runQueries(queries)
}

const topUsersBucketReducer = (acc: Record<string, UsersEventCount>, item: BotEvent): Record<string, UsersEventCount> => {
  if (!acc[item.uid]) {
    acc[item.uid] = {
      value: 0,
      item
    }
  }

  acc[item.uid].value++
  return acc
}

type SegmentExtractor = (event: BotEvent) => string

const getSegmetExtractorForPeriod = (period: string): SegmentExtractor => {
  if (PERIODS.includes(period))
    return ({ date }) => date

  return ({ time }) => moment(time).format('HH:00')
}

// @ts-ignore
promiseWorker.register((request: WorkerRequest): Promise<WorkerResult> => {
  const segmentExtractor = getSegmetExtractorForPeriod(request.period)

  const eventsReducer = segmentBucketReducer(segmentExtractor, ({ type }) => type)
  const eventsCounterReducer = bucketReducer<BotEvent>(({ type }) => type)
  const botsReducer = segmentBucketReducer(segmentExtractor, ({ bot }) => bot)
  const usersLanguagesReducer = uniqueBucketReducer<BotEvent>(({ language_code }) => language_code!, ({ uid }) => uid)
  const botsCounterReducer = bucketReducer<BotEvent>(({ bot }) => bot)
  const usersReducer = uniqueBucketReducer(segmentExtractor, ({ uid }) => uid)

  return processPeriod(
    request,
    (acc, item) => {
      acc.eventsBucket = eventsReducer(acc.eventsBucket, item) ?? acc.eventsBucket
      acc.eventsCountBucket = eventsCounterReducer(acc.eventsCountBucket, item) ?? acc.eventsCountBucket
      acc.botsBucket = botsReducer(acc.botsBucket, item) ?? acc.botsBucket
      acc.botsCountBucket = botsCounterReducer(acc.botsCountBucket, item) ?? acc.botsCountBucket
      acc.usersLanguagesBucket = usersLanguagesReducer(acc.usersLanguagesBucket, item) ?? acc.usersLanguagesBucket
      acc.usersBucket = usersReducer(acc.usersBucket, item) ?? acc.usersBucket
      acc.topUsersBucket = topUsersBucketReducer(acc.topUsersBucket, item)
      return acc
    },
    {
      eventsBucket: bucketInitState<Counting>(),
      eventsCountBucket: bucketInitState<PieData>(),
      botsBucket: bucketInitState<Counting>(),
      usersLanguagesBucket: bucketInitState<Unique>(),
      botsCountBucket: bucketInitState<PieData>(),
      usersBucket: bucketInitState<Unique>(),
      topUsersBucket: {}
    }
  )
})
