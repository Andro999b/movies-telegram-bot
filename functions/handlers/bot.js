const analytics = require('./bot/midleware/analytics')
const tracker = require('../tracker')
const path = require('path')
const { Telegraf } = require('telegraf')
const TelegrafI18n = require('telegraf-i18n')
const makeHandler = require('lambda-request-handler')
const debug = require('debug')

const BOT_TYPE = process.env.BOT_TYPE
const PROVIDERS = (BOT_TYPE == 'anime' ? process.env.ANIME_PROVIDERS : process.env.FILMS_PROVIDERS).split(',')

const i18n = new TelegrafI18n({
    defaultLanguage: 'uk',
    allowMissing: false, // Default true
    directory: path.resolve(__dirname, '..', process.env.LOCALIZATION_TYPE || 'localization')
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
module.exports.handler = async (event, context) => {
    debug(JSON.stringify(event)) 
    return botHanler(event, context)
}
