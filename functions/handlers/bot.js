
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
const MAX_UNFOLD_RESULTS = 3

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
    answerCbQuery,
    callbackQuery: { data },
    reply
}) => {
    const { query, searchId, providersResults } = session

    if (query && providersResults && searchId) {
        const [_, requestSearchId, provider] = data.split('#')

        if (requestSearchId == searchId) {
            const results = providersResults.find((res) =>
                res[0].provider == provider
            )

            await reply(
                i18n.t('provider_results', { query, provider }),
                Markup.inlineKeyboard(createResultButtons(results), { columns: 1 }).extra()
            )
            return await answerCbQuery()
        }
    }

    return await answerCbQuery(i18n.t('results_expired'))
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
    session.query = query
    session.searchId = searchId

    if(providers.length == 1) {
        await reply(
            i18n.t('provider_results', { query, provider: providers[0] }),
            Markup.inlineKeyboard(
                createResultButtons(providersResults[0]),
                { columns: 1 }
            ).extra()
        )
    } else {
        await reply(
            i18n.t(
                'results',
                { query }
            ),
            getResultsKeyboard(providersResults, searchId, i18n).extra()
        )
    }

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

function getResultsKeyboard(providersResults, searchId, i18n) {
    return Markup.inlineKeyboard(
        providersResults
            .sort((a, b) => a.length - b.length)
            .map((res) => {
                if (res.length > MAX_UNFOLD_RESULTS) {
                    const provider = res[0].provider
                    return [
                        Markup.callbackButton(
                            i18n.t('more_results', { count: res.length, provider }),
                            `more_results#${searchId}#${provider}`
                        )
                    ]
                } else {
                    return createResultButtons(res)
                }
            })
            .reduce((acc, items) => acc.concat(items), []),
        { columns: 1 }
    )
}

function createResultButtons(res) {
    return res.map((result) =>
        Markup.urlButton(
            `[${result.provider}] ${result.name}`,
            `${process.env.PLAYER_URL}?provider=${result.provider}&id=${result.id}`
        )
    )
}

module.exports.handler = async (event) => {
    const body = JSON.parse(event.body)

    await bot.handleUpdate(body)

    return makeResponse({ input: event })
}