import { Telegraf } from 'telegraf'
import { BotContext } from './types.js'
import doSearch from './functions/doSearch.js'

export default (bot: Telegraf<BotContext>, defaultProviders: string[]): void => {
  bot.on('callback_query', async (ctx) => {
    await doSearch(ctx, defaultProviders, ctx.callbackQuery.data)
    return ctx.answerCbQuery()
  })
  bot.on('text', (ctx) => doSearch(ctx, defaultProviders, ctx.message.text))
}