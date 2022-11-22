import { runQuery } from '../database/dynamodb'
import { TABLE_NAME } from '../constants'
import { bucketInitState, bucketReducer, getUserName, toBotEvent } from '../utils'
import { BotEvent, PieData } from '../types'
import { QueryCommandInput } from '@aws-sdk/client-dynamodb'

interface BotUserStore {
  error: null | string
  loading: boolean
  bots: PieData[]
  eventsPie: PieData[]
  events: BotEvent[]
  name: null | string

  load: (uid: string) => void
}


export default (): BotUserStore => ({
  error: null,
  loading: true,
  bots: [],
  eventsPie: [],
  events: [],
  name: null,

  load(uid: string): void {
    this.bots = []
    this.eventsPie = []

    const query: QueryCommandInput = {
      TableName: TABLE_NAME,
      IndexName: 'userIdx',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: {
        '#key': 'uid'
      },
      ExpressionAttributeValues: {
        ':value': {
          N: uid
        }
      },
      ScanIndexForward: false,
      Limit: 100
    }

    const eventsReducer = bucketReducer<BotEvent>(({ type }) => type)
    const botsReducer = bucketReducer<BotEvent>(({ bot }) => bot)

    this.error = null

    runQuery(query)
      .then(({ items }) => {
        this.events = items.map(toBotEvent)
        this.eventsPie = this.events.reduce(eventsReducer, bucketInitState()).chartData
        this.bots = this.events.reduce(botsReducer, bucketInitState()).chartData
        this.loading = false

        if (items.length)
          this.name = getUserName(this.events[0])
      })
      .catch((error) => this.error = error.message)
  }
})
