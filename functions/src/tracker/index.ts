export * from './dynamodbTracker.js'

export type AnalyticFieldType = string | number | null | undefined | (string | number)[]

export interface AnalyticEvent {
  uid?: number
  time: number
  resultsCount?: number
  bot?: string
  firstname?: string
  lastname?: string
  username?: string
  language_code?: string
  type?: string
  [key: string]: AnalyticFieldType
}

export type AnalyticsHandler = (events: AnalyticEvent[]) => Promise<void>