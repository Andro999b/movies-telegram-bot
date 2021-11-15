const makeResponse = require('../utils/makeResponse')
const analytics = require('./bot/midleware/analytics')
const tracker = require('../tracker')
const path = require('path')
const Telegraf = require('telegraf')
const TelegrafI18n = require('telegraf-i18n')

const BOT_TYPE = process.env.BOT_TYPE
const PROVIDERS = (BOT_TYPE == 'anime' ? process.env.ANIME_PROVIDERS : process.env.FILMS_PROVIDERS).split(',')

const i18n = new TelegrafI18n({
    defaultLanguage: 'ru',
    allowMissing: false, // Default true
    directory: path.resolve(__dirname, '..', process.env.LOCALIZATION_TYPE || 'localization')
})

const bot = new Telegraf(process.env.TOKEN)

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

module.exports.handler = async (event) => {
    const body = JSON.parse(event.body)

    await bot.handleUpdate(body)

    return makeResponse({ input: event })
}