const extractSearchEngineQuery = require('../../utils/extractSearchEngineQuery')
const providersService = require('../../providers')
const Markup = require('telegraf/markup')
const uuid = require('uuid')

const MAX_UNFOLD_RESULTS = process.env.MAX_UNFOLD_RESULTS || 3
const PLAYER_URL = process.env.PLAYER_URL

module.exports = (bot, defaultProviders, inlineProviders, botType) => {
    bot.on('callback_query', async (ctx) => {
        await doSearch(ctx, ctx.callbackQuery.data)
        await ctx.answerCbQuery()
    })
    bot.on('text', async (ctx) => doSearch(ctx, ctx.message.text))
    bot.on('inline_query', async ({ i18n, inlineQuery, answerInlineQuery, mixpanel }) => {
        const { query, providers } = getQueryAndProviders(inlineQuery.query, inlineProviders)
    
        mixpanel.track('inlinesearch', { query: inlineQuery.query, bot: botType })
    
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
                    `${PLAYER_URL}?provider=${provider}&id=${id}`
                )
            ])
        })))
    })

    async function doSearch({ i18n, reply, replyWithChatAction, mixpanel, from }, text) {
        await replyWithChatAction('typing')
    
        mixpanel.track('search', { query: text, bot: botType })
        mixpanel.people.set({ $last_seen: new Date().toISOString() })

    
        let { query, providers } = getQueryAndProviders(text, defaultProviders)
    
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
            mixpanel.track('noresults', { query: text, bot: botType })
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
                    createResultButtons(results)
                        .concat(
                            [Markup.callbackButton(i18n.t('help_search_title'), 'helpsearch')]
                        ),
                    { columns: 1 }
                ).extra()
            )
        } else {
            await reply(
                i18n.t('results', { query }),
                getResultsKeyboad(providersResults, query, i18n).extra()
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
    
    function getResultsKeyboad(providersResults, query, i18n) {
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
                        return createResultButtons(res)
                    }
                })
                .reduce((acc, items) => acc.concat(items), [])
                .concat([Markup.callbackButton(i18n.t('help_search_title'), 'helpsearch')]),
            { columns: 1 }
        )
    }
    
    function createResultButtons(res) {
        return res.map((result) =>
            Markup.urlButton(
                `[${result.provider}] ${result.name}`,
                `${PLAYER_URL}?provider=${result.provider}&id=${result.id}`
            )
        )
    }
}