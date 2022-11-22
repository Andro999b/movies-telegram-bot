import { makeAutoObservable, observable } from 'mobx'
import { runQuery } from '../database/dynamodb'
import { TABLE_NAME, EVENTS_UPDATE_INTERVAL } from '../constants'
import { isToday, toBotEvent } from '../utils'
import periodStore from './periodStore'
import { QueryCommandInput } from '@aws-sdk/client-dynamodb'
import { BotEventWithFilter } from '../types'

let loading = false
let interval: NodeJS.Timeout | null = null

class BotEventsStore {
  error: string | null = null
  events: BotEventWithFilter[] = []
  lastTs: number | null = null
  initialized = false

  constructor() {
    makeAutoObservable(this)
  }

  startUpdate(): void {
    if (interval) clearInterval(interval)
    interval = setInterval(
      () => {
        if (isToday(periodStore.date)) this.loadStratingFromTS(this.lastTs)
      },
      EVENTS_UPDATE_INTERVAL
    )
  }

  stopUpdate(): void {
    if (interval) clearInterval(interval)
  }

  loadStratingFromTS(ts: number | null): void {
    if (loading) return
    loading = true

    const keyValue = periodStore.getFormatedDate()

    const query: QueryCommandInput = ts ?
      {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#key = :value AND #range > :ts',
        ExpressionAttributeNames: {
          '#key': 'date',
          '#range': 'time'
        },
        ExpressionAttributeValues: {
          ':value': {
            S: keyValue
          },
          ':ts': {
            N: ts.toString()
          }
        }
      } :
      {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#key = :value',
        ExpressionAttributeNames: {
          '#key': 'date'
        },
        ExpressionAttributeValues: {
          ':value': {
            S: keyValue
          }
        }
      }


    this.error = null

    runQuery(query)
      .then(({ items }) => {
        loading = false
        this.initialized = true
        this.events = items
          .map((r) => toBotEvent(r) as BotEventWithFilter)
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

  }

  setDate(date: Date): void {
    periodStore.setDate(date)
    this.reload()
  }

  reload(): void {
    this.initialized = false
    this.events = []
    this.loadStratingFromTS(null)
  }

  init(): VoidFunction {
    this.reload()
    this.startUpdate()

    return (): void => this.stopUpdate()
  }
}

export default observable(new BotEventsStore())
