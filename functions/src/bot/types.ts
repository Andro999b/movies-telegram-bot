import { Context } from 'telegraf'
import I18n from 'telegraf-i18n'
import { AnalyticFieldType } from '../tracker/index.js'
import { ProvidersNames } from '../types/providersConfig.js'

export interface AnalyticContext extends Context {
  track: (type: string, data?: Record<string, AnalyticFieldType>) => void
}

export type BotContext = Context & AnalyticContext & { i18n: I18n }

export interface QueryAndProviders {
  query: string,
  providers: ProvidersNames[],
  page: number
}
