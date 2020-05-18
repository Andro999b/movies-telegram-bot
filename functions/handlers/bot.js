const makeResponse = require('../utils/makeResponse')
const path = require('path')
const Telegraf = require('telegraf')
const TelegrafI18n = require('telegraf-i18n')
const TelegrafMixpanel = require('telegraf-mixpanel')

const PROVIDERS = process.env.PROVIDERS ? process.env.PROVIDERS.split(',') : []
const INLINE_PROVIDERS = process.env.INLINE_PROVIDERS ? process.env.INLINE_PROVIDERS.split(',') : PROVIDERS
const BOT_TYPE = process.env.BOT_TYPE || 'default'

const i18n = new TelegrafI18n({
    defaultLanguage: 'ru',
    allowMissing: false, // Default true
    directory: path.resolve(__dirname, '..', process.env.LOCALIZATION_TYPE || 'localization')
})

const bot = new Telegraf(process.env.TOKEN)
const mixpanel = new TelegrafMixpanel(process.env.MIXPANEL_TOKEN)

bot.use(i18n.middleware())
bot.use(mixpanel.middleware())

require('./botCommands/start')(bot, PROVIDERS, BOT_TYPE)
require('./botCommands/helpsearch')(bot, BOT_TYPE)
require('./botCommands/search')(bot, PROVIDERS, INLINE_PROVIDERS, BOT_TYPE)

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