import { BotEvent, Bucket, Counting, PieData, Unique } from './index'
import { Credentials } from '@aws-sdk/types'

export interface WorkerRequest {
  period: string,
  credentials: Credentials
}

export interface UsersEventCount {
  value: number
  item: BotEvent
}

export interface WorkerResult {
  eventsBucket: Bucket<Counting>
  eventsCountBucket: Bucket<PieData>
  botsBucket: Bucket<Counting>
  botsCountBucket: Bucket<PieData>
  usersLanguagesBucket: Bucket<Unique>
  usersBucket: Bucket<Unique>
  topUsersBucket: Record<string, UsersEventCount>
}
