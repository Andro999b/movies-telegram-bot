import analytics from './bot/midleware/analytics'
import tracker from '../tracker'
import path from 'path'
import { Telegraf } from 'telegraf'
import TelegrafI18n from 'telegraf-i18n'
import makeHandler from 'lambda-request-handler'
import debugFactory from 'debug'
const debug = debugFactory('bot')

const BOT_TYPE = process.env.BOT_TYPE
const PROVIDERS =  process.env.PROVIDERS.split(',')

const i18n = new TelegrafI18n({
    defaultLanguage: 'uk',
    allowMissing: false, // Default true
    directory: path.resolve(__dirname, '..', 'localization', BOT_TYPE)
})

const bot = new Telegraf(process.env.TOKEN, { telegram: { webhookReply: false }})

bot.use(i18n.middleware())
bot.use(analytics(tracker(), BOT_TYPE))

require('./bot/start')(bot, PROVIDERS)
require('./bot/search')(bot, PROVIDERS)

bot.catch((err) => {
    if (err.response && err.response.error_code === 403) {
        // noop
    } else {
        console.error('Fail process bot command', err)
    }
})

const botHanler = makeHandler(bot.webhookCallback(process.env.BOT_HOOK_PATH ?? '/bot'))

export const handler = async (event, context) => {
    debug(JSON.stringify(event)) 
    return botHanler(event, context)
}
