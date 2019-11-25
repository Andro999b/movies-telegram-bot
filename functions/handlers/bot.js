
const makeResponse = require('../utils/makeResponse')
const providersService = require('../providers')
const path = require('path')
const Telegraf = require('telegraf')
const TelegrafI18n = require('telegraf-i18n')
const Markup = require('telegraf/markup')
const session = require('telegraf/session')

const DEFAULT_PROVIDERS = ['seasonvar', 'kinogo', 'animeVost']

const i18n = new TelegrafI18n({
    defaultLanguage: 'ru',
    allowMissing: false, // Default true
    directory: path.resolve(__dirname, '..', 'locales')
})

const bot = new Telegraf(process.env.TOKEN)
bot.use(session())
bot.use(i18n.middleware())

bot.command('start', ({ i18n, reply }) => reply(i18n.t('start')))

bot.command('providers', ({ i18n, reply }) => reply(
    i18n.t('providers'),
    Markup.inlineKeyboard(
        providersService.getProviders().map((provider) =>
            Markup.callbackButton(provider, provider)
        ).concat(
            Markup.callbackButton('default', 'default')
        ),
        { columns: 3 }
    ).oneTime().extra()
))

providersService.getProviders().forEach((provider) =>
    bot.action(provider, async ({ i18n, session, answerCbQuery }) => {
        session.provider = provider
        await answerCbQuery(i18n.t('provider_answer', { provider }))
    })
)

bot.action('default', async ({ i18n, session, answerCbQuery }) => {
    session.provider = null
    await answerCbQuery(i18n.t('provider_default'))
})

bot.on('text', async ({ i18n, session, reply, replyWithChatAction, message }) => {
    const provider = session.provider
    session.provider = null

    const providers = provider ? [provider] : DEFAULT_PROVIDERS

    await replyWithChatAction('typing')

    const q = message.text
    const results = await providersService.search(providers, q)

    if(!results.length)
        return await reply(i18n.t('no_results', { q }))

    await reply(
        i18n.t('results', { q }),
        Markup.inlineKeyboard(
            results.map((result) =>
                Markup.urlButton(
                    result.name,
                    `${process.env.PLAYER_URL}?provider=${result.provider}&id=${result.id}`
                )
            ),
            { columns: 1 }
        ).extra()
    )
})

module.exports = async (event) => {
    const body = JSON.parse(event.body)

    await bot.handleUpdate(body)

    return makeResponse({ input: event })
}