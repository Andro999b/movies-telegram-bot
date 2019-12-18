
const makeResponse = require('../utils/makeResponse')
const providersService = require('../providers')
const path = require('path')
const Telegraf = require('telegraf')
const TelegrafI18n = require('telegraf-i18n')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const session = require('telegraf/session')
const uuid = require('uuid')

const PROVIDER = process.env.PROVIDER ? process.env.PROVIDER.split(',') : []
const INLINE_PROVIDERS = process.env.INLINE_PROVIDERS ? process.env.INLINE_PROVIDERS.split(',') : PROVIDER
const PAGE_SIZE = 3

const i18n = new TelegrafI18n({
    defaultLanguage: 'ru',
    allowMissing: false, // Default true
    directory: path.resolve(__dirname, '..', 'locales')
})

const bot = new Telegraf(process.env.TOKEN)

bot.use(session())
bot.use(i18n.middleware())
bot.command('start', ({ i18n, reply }) => reply(
    i18n.t(
        'start',
        {
            sample: PROVIDER[0],
            providers: PROVIDER.map((it) => ` - ${it}`).join('\n')
        }
    ),
    Extra.HTML()
))
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
    const searchId = uuid.v4()

    await replyWithChatAction('typing')

    const { query, providers } = getQueryAndProviders(message.text, PROVIDER)

    let providersResults = await Promise.all(providers.map((providerName) =>
        providersService.searchOne(providerName, query)
    ))

    providersResults = providersResults.filter((res) => res && res.length)

    if (!providersResults.length)
        return await reply(i18n.t('no_results', { query }))

    session.providersResults = providersResults
    session.page = 1
    session.searchId = searchId

    const { results, hasMore } = getResults(providersResults, 1)

    await reply(
        i18n.t('results', { query }),
        getResultsKeyboad(searchId, results, hasMore, i18n).extra()
    )
})
bot.on('inline_query', async ({ i18n, inlineQuery, answerInlineQuery }) => {
    const { query, providers } = getQueryAndProviders(inlineQuery.query, INLINE_PROVIDERS)

    const results = await providersService.search(providers, query)

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

function getQueryAndProviders(query, avaliableProviders) {
    if (query.startsWith('#')) {
        const sepIndex = query.indexOf(' ')
        if (sepIndex != -1) {
            const provider = query.substr(1, sepIndex - 1)
            const q = query.substr(sepIndex + 1)

            if (avaliableProviders.indexOf(provider) != -1) {
                return { query: q, providers: [provider] }
            }
        }
    }

    return { query, providers: avaliableProviders }
}

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

module.exports.handler = async (event) => {
    const body = JSON.parse(event.body)

    await bot.handleUpdate(body)

    return makeResponse({ input: event })
}