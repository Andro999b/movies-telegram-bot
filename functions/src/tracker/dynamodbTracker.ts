import { DateTime } from 'luxon'
import { AnalyticEvent, AnalyticFieldType, AnalyticsHandler } from './index'
import dynamodb from '../db/dynamodb'
import { AttributeValue, BatchWriteItemCommand, WriteRequest } from '@aws-sdk/client-dynamodb'

export const tracker = (): AnalyticsHandler => {
  const tableName = process.env.ANALYTIC_TABLE
  const timezone = process.env.ANALYTIC_TIMEZONE
  const analyticsTTL = 3600 * 24 * parseInt(process.env.ANALYTIC_RETENTION)

  const typeMapping: Record<string, 'N' | 'S'> = {
    uid: 'N',
    time: 'N',
    resultsCount: 'N'
  }

  const mapper = (key: string, value: AnalyticFieldType): AttributeValue => {
    const type: 'N' | 'S' = typeMapping[key] || 'S'

    if (Array.isArray(value)) {
      value = value.join(',')
    } else if (value === undefined || value === null) {
      value = ''
    } else {
      value = '' + value
    }

    // @ts-ignore
    return {
      [type]: value
    }
  }

  return async (events: AnalyticEvent[]): Promise<void> => {
    const requests: WriteRequest[] = events.map((event) => {
      const today = timezone ? DateTime.utc().setZone(timezone) : DateTime.utc()
      const date = today.toFormat('y-M-d')
      const month = today.toFormat('y-M')

      const Item: Record<string, AttributeValue> = {
        date: {
          'S': date
        },
        month: {
          'S': month
        },
        ttl: {
          'N': '' + (Math.floor(Date.now() / 1000) + analyticsTTL)
        }
      }

      Object.keys(event).forEach((key) => {
        Item[key] = mapper(key, event[key])
      })

      return { PutRequest: { Item } }
    })

    await dynamodb.send(new BatchWriteItemCommand({
      RequestItems: {
        [tableName]: requests
      }
    }))
  }
}