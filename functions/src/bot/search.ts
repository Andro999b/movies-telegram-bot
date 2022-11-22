import { Telegraf } from 'telegraf'
import { BotContext } from './types'
import doSearch from './functions/doSearch'
import { ProvidersNames } from '../types/providersConfig'

export default (bot: Telegraf<BotContext>, defaultProviders: ProvidersNames[]): void => {
  bot.on('callback_query', async (ctx) => {
    await doSearch(ctx, defaultProviders, ctx.callbackQuery.data)
    return ctx.answerCbQuery()
  })
  bot.on('text', (ctx) => doSearch(ctx, defaultProviders, ctx.message.text))
}