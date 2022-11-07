import { Middleware } from 'telegraf'
import { AnalyticEvent, AnalyticsHandler } from '../../tracker/index.js'
import { AnalyticContext } from '../types.js'

export default (tracker: AnalyticsHandler, bot: string): Middleware<AnalyticContext> => async (ctx, next) => {
  const events: AnalyticEvent[] = []

  ctx.track = (type: string, data = {}): void => {
    events.push({
      time: Date.now(),
      uid: ctx.from?.id,
      bot,
      firstname: ctx.from?.first_name,
      lastname: ctx.from?.last_name,
      username: ctx.from?.username,
      language_code: ctx.from?.language_code,
      type,
      ...data
    })
  }

  await next()
  if (events.length) await tracker(events)
}