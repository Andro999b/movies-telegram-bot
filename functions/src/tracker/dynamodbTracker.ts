import { PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb'
import { DateTime } from 'luxon'
import { AnalyticEvent, AnalyticFieldType, AnalyticsHandler } from './index.js'
import dynamodb from '../db/dynamodb.js'

export const tracker = (): AnalyticsHandler => {
  const tableName = process.env.ANALYTIC_TABLE || 'analyticsEvents'
  const timezone = process.env.ANALYTIC_TIMEZONE || 'analyticsEvents'
  const analyticsTTL = 3600 * 24 * parseInt(process.env.ANALYTIC_RETENTION ?? '90')

  const typeMapping: Record<string, string> = {
    uid: 'N',
    time: 'N',
    resultsCount: 'N'
  }

  const mapper = (key: string, value: AnalyticFieldType): Record<string, string> => {
    const type = typeMapping[key] || 'S'

    if (Array.isArray(value)) {
      value = value.join(',')
    } else if (value === undefined || value === null) {
      value = ''
    } else {
      value = '' + value
    }

    return { [type]: value }
  }

  return async (events: AnalyticEvent[]): Promise<void> => {
    const requests = events.map((event) => {
      const today = timezone ? DateTime.utc().setZone(timezone) : DateTime.utc()
      const date = today.toFormat('y-M-d')
      const month = today.toFormat('y-M')

      const Item: PutItemInputAttributeMap = {
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

    await new Promise((resolve) => {
      dynamodb.batchWriteItem(
        {
          RequestItems: {
            [tableName]: requests
          }
        },
        (err) => {
          if (err) console.error('Fail to track events', events, err)
          resolve(null)
        }
      )
    })
  }
}