import * as url from 'url'
import analytics from '../bot/midleware/analytics'
import { tracker } from '../tracker/index'
import path from 'path'
import { Telegraf } from 'telegraf'
import TelegrafI18n from 'telegraf-i18n'
import makeHandler, { APIGatewayEventHandler } from 'lambda-request-handler'
import debugFactory from 'debug'
import startAugmentation from '../bot/start'
import searchAugmentation from '../bot/search'
import { BotContext } from '../bot/types'
import { ProvidersNames } from '../types/providersConfig'

const debug = debugFactory('bot')

const BOT_TYPE = process.env.BOT_TYPE
const PROVIDERS = process.env.PROVIDERS.split(',') as ProvidersNames[]

const i18n = new TelegrafI18n({
  defaultLanguage: 'uk',
  allowMissing: false, // Default true
  directory: path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..', 'localization', BOT_TYPE)
})

const bot = new Telegraf(process.env.TOKEN, { telegram: { webhookReply: false } })

bot.use(i18n.middleware())
bot.use(analytics(tracker(), BOT_TYPE))

startAugmentation(bot as Telegraf<BotContext>, PROVIDERS)
searchAugmentation(bot as Telegraf<BotContext>, PROVIDERS)

bot.catch((err) => {
  console.error('Fail process bot command', err)
})

const botHanler = makeHandler(bot.webhookCallback(process.env.BOT_HOOK_PATH ?? '/bot'))

export const handler: APIGatewayEventHandler = (event, context) => {
  debug(JSON.stringify(event))
  return botHanler(event, context)
}
