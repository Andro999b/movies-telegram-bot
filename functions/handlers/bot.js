
const makeResponse = require('../utils/makeResponse')
const extractSearchEngineQuery = require('../utils/extractSearchEngineQuery')
const providersService = require('../providers')
const path = require('path')
const Telegraf = require('telegraf')
const TelegrafI18n = require('telegraf-i18n')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const TelegrafMixpanel = require('telegraf-mixpanel')
const uuid = require('uuid')

const PROVIDER = process.env.PROVIDER ? process.env.PROVIDER.split(',') : []
const INLINE_PROVIDERS = process.env.INLINE_PROVIDERS ? process.env.INLINE_PROVIDERS.split(',') : PROVIDER
const MAX_UNFOLD_RESULTS = 3

const i18n = new TelegrafI18n({
    defaultLanguage: 'ru',
    allowMissing: false, // Default true
    directory: path.resolve(__dirname, '..', process.env.LOCALIZATION_TYPE || 'localization')
})

const bot = new Telegraf(process.env.TOKEN)
const mixpanel = new TelegrafMixpanel(process.env.MIXPANEL_TOKEN)

bot.use(i18n.middleware())
bot.use(mixpanel.middleware())

bot.command(['start', 'help'], async ({ i18n, reply, mixpanel, message: { text } }) => {
    if(text.endsWith('start')) {
        mixpanel.track('register')
        mixpanel.people.set({ $created: new Date().toISOString() })
    }

    await reply(
        i18n.t(
            'start',
            {
                sample: PROVIDER[0],
                providers: PROVIDER.map((it) => ` - ${it}`).join('\n')
            }
        ),
        Extra.HTML()
    )
})
bot.action('helpsearch', async ({ i18n, reply, replyWithMediaGroup, answerCbQuery, mixpanel }) => {
    mixpanel.track('helpsearch')

    await reply(i18n.t('help_search_text'))
    await replyWithMediaGroup([
        {
            type: 'photo',
            media: 'https://films-seach-bot-images.s3.eu-central-1.amazonaws.com/1.png'
        },
        {
            type: 'photo',
            media: 'https://films-seach-bot-images.s3.eu-central-1.amazonaws.com/2.png'
        },
        {
            type: 'photo',
            media: 'https://films-seach-bot-images.s3.eu-central-1.amazonaws.com/3.png'
        },
    ])
    await answerCbQuery()
})
bot.on('callback_query', async (ctx) => {
    await doSearch(ctx, ctx.callbackQuery.data)
    await ctx.answerCbQuery()
})
bot.on('text', async (ctx) => doSearch(ctx, ctx.message.text))
bot.on('inline_query', async ({ i18n, inlineQuery, answerInlineQuery, mixpanel }) => {
    const { query, providers } = getQueryAndProviders(inlineQuery.query, INLINE_PROVIDERS)

    mixpanel.track('inlinesearch', { query: inlineQuery.query })

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

bot.catch((err) => {
    if (err.response && err.response.error_code === 403) {
        // noop
    } else {
        console.error('Fail process bot command', err)
    }
})

async function doSearch({ i18n, reply, replyWithChatAction, mixpanel, from }, text) {
    await replyWithChatAction('typing')

    mixpanel.track('search', { query: text })
    mixpanel.people.set({ $last_seen: new Date().toISOString() })

    const uid = from.id

    let { query, providers } = getQueryAndProviders(text, PROVIDER)

    // check link
    const parts = query.match(/http?s:\/\/[^\s]+/)

    if (parts && parts.length > 0) {
        const searchEngineQuery = await extractSearchEngineQuery(parts[0])
        if (searchEngineQuery)
            query = searchEngineQuery
    }
    // check link ends

    let providersResults = await Promise.all(providers.map((providerName) =>
        providersService.searchOne(providerName, query)
    ))

    providersResults = providersResults.filter((res) => res && res.length)

    if (!providersResults.length) {
        mixpanel.track('noresults', { query: text })
        return await reply(
            i18n.t('no_results', { query }),
            Markup.inlineKeyboard(
                [Markup.callbackButton(i18n.t('help_search_title'), 'helpsearch')],
                { columns: 1 }
            ).extra()
        )
    }


    if (providersResults.length == 1) {
        const results = providersResults[0]
        const provider = results[0].provider
        await reply(
            i18n.t('provider_results', { query, provider }),
            Markup.inlineKeyboard(
                createResultButtons(results, uid)
                    .concat(
                        [Markup.callbackButton(i18n.t('help_search_title'), 'helpsearch')]
                    ),
                { columns: 1 }
            ).extra()
        )
    } else {
        await reply(
            i18n.t('results', { query }),
            getResultsKeyboad(providersResults, query, uid, i18n).extra()
        )
    }
}

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

function getResultsKeyboad(providersResults, query, uid, i18n) {
    return Markup.inlineKeyboard(
        providersResults
            .sort((a, b) => a.length - b.length)
            .map((res) => {
                if (res.length > MAX_UNFOLD_RESULTS) {
                    const provider = res[0].provider
                    return [
                        Markup.callbackButton(
                            i18n.t('more_results', { count: res.length, provider }),
                            `#${provider} ${query}`
                        )
                    ]
                } else {
                    return createResultButtons(res, uid)
                }
            })
            .reduce((acc, items) => acc.concat(items), [])
            .concat([Markup.callbackButton(i18n.t('help_search_title'), 'helpsearch')]),
        { columns: 1 }
    )
}

function createResultButtons(res, uid) {
    return res.map((result) =>
        Markup.urlButton(
            `[${result.provider}] ${result.name}`,
            `${process.env.PLAYER_URL}?provider=${result.provider}&id=${result.id}&uid=${uid}`
        )
    )
}

module.exports.handler = async (event) => {
    const body = JSON.parse(event.body)

    await bot.handleUpdate(body)

    return makeResponse({ input: event })
}