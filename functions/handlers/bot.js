
const makeResponse = require('../utils/makeResponse')
const providersService = require('../providers')
const path = require('path')
const Telegraf = require('telegraf')
const TelegrafI18n = require('telegraf-i18n')
const Markup = require('telegraf/markup')
const session = require('telegraf/session')
const uuid = require('uuid')

const DEFAULT_PROVIDERS = ['exfs', 'seasonvar', 'animeVost', 'kinogo']
const PAGE_SIZE = 3

const i18n = new TelegrafI18n({
    defaultLanguage: 'ru',
    allowMissing: false, // Default true
    directory: path.resolve(__dirname, '..', 'locales')
})

const bot = new Telegraf(process.env.TOKEN)

bot.use(session())
bot.use(i18n.middleware())

bot.command('start', ({ i18n, reply }) => reply(i18n.t('start')))

bot.command('settings', async ({ i18n, reply, deleteMessage, session: { provider } }) => {
    await deleteMessage()
    await reply(
        // render current settings
        provider ? i18n.t('settings', { provider }) : i18n.t('settings_default'),
        // render keyboard
        Markup.inlineKeyboard(
            providersService.getProviders().map((provider) =>
                Markup.callbackButton(`🔍 ${provider}`, provider)
            ).concat(
                Markup.callbackButton('🔄 default', 'default')
            ),
            { columns: 3 }
        ).oneTime().extra()
    )
})

providersService.getProviders().forEach((provider) =>
    bot.action(provider, async ({ i18n, session, reply, answerCbQuery, deleteMessage }) => {
        session.provider = provider
        await deleteMessage()
        await reply(i18n.t('provider_answer', { provider }))
        await answerCbQuery()
    })
)

bot.action('default', async ({ i18n, session, reply, answerCbQuery, deleteMessage }) => {
    session.provider = null
    await deleteMessage()
    await reply(i18n.t('provider_default'))
    await answerCbQuery()
})


bot.action(/more_results.+/, async ({
    i18n,
    session,
    editMessageReplyMarkup,
    answerCbQuery,
    callbackQuery: { data, message }
}) => {
    const { searchId, providersResults, page } = session

    if (searchId &&
        providersResults &&
        page &&
        data == `more_results#${searchId}`
    ) {
        session.page = page + 1

        const { results, hasMore } = getResults(providersResults, session.page)

        await editMessageReplyMarkup(
            getResultsKeyboad(searchId, results, hasMore, i18n)
        )
    } else { // remove uselsess show more
        const { inline_keyboard } = message.reply_markup
        
        inline_keyboard.pop()

        await editMessageReplyMarkup({ inline_keyboard })
    }

    await answerCbQuery()
})

bot.on('text', async ({ i18n, session, reply, replyWithChatAction, message }) => {
    const provider = session.provider
    const providers = provider ? [provider] : DEFAULT_PROVIDERS
    const searchId = uuid.v4()

    await replyWithChatAction('typing')

    const q = message.text

    let providersResults = await Promise.all(providers.map((providerName) =>
        providersService.searchOne(providerName, q)
    ))

    providersResults = providersResults.filter((res) => res && res.length)

    if (!providersResults.length)
        return await reply(i18n.t('no_results', { q }))

    session.providersResults = providersResults
    session.page = 1
    session.searchId = searchId

    const { results, hasMore } = getResults(providersResults, 1)

    await reply(
        i18n.t('results', { q }),
        getResultsKeyboad(searchId, results, hasMore, i18n).extra()
    )
})

bot.on('inline_query', async ({ i18n, inlineQuery, answerInlineQuery }) => {
    const q = inlineQuery.query

    const results = await providersService.search(['seasonvar', 'animeVost', 'kinogo'], q)

    await answerInlineQuery(results.map(({ name, image, provider, id }) => ({
        type: 'article',
        id: uuid.v4(),
        title: name,
        description: provider,
        thumb_url: image,
        input_message_content: {
            message_text: name
        },
        reply_markup: Markup.inlineKeyboard([
            Markup.urlButton(
                i18n.t('watch'),
                `${process.env.PLAYER_URL}?provider=${provider}&id=${id}`
            )
        ])
    })))
})

function getResultsKeyboad(searchId, results, hasMore, i18n) {
    let buttons = results.map((result) =>
        Markup.urlButton(
            `[${result.provider}] ${result.name}`,
            `${process.env.PLAYER_URL}?provider=${result.provider}&id=${result.id}`
        )
    )

    if (hasMore) {
        buttons = buttons.concat(Markup.callbackButton(
            i18n.t('more_results'),
            `more_results#${searchId}`
        ))
    }

    return Markup.inlineKeyboard(buttons, { columns: 1 })
}

function getResults(providersResults, page) {
    const chunks = []

    for (let cur = 0; cur < page; cur++) {
        providersResults
            .map((res) => res.slice(cur * PAGE_SIZE, (cur + 1) * PAGE_SIZE))
            .filter((chunk) => chunk.length)
            .forEach((chunk) => chunks.push(chunk))
    }

    const totalItems = providersResults.reduce((acc, items) => acc + items.length, 0)
    const results = chunks.reduce((acc, items) => acc.concat(items), [])
    const hasMore = totalItems > results.length

    return {
        results,
        hasMore
    }
}

module.exports = async (event) => {
    const body = JSON.parse(event.body)

    await bot.handleUpdate(body)

    return makeResponse({ input: event })
}