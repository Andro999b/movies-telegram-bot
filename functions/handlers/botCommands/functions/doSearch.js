
const extractSearchEngineQuery = require('../../../utils/extractSearchEngineQuery')
const providersService = require('../../../providers')
const getQueryAndProviders = require('./getQueryAndProviders')
const Markup = require('telegraf/markup')

const MAX_UNFOLD_RESULTS = process.env.MAX_UNFOLD_RESULTS || 3
const PLAYER_URL = process.env.PLAYER_URL


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
                    return createResultButtons(res, query)
                }
            })
            .reduce((acc, items) => acc.concat(items), [])
            .concat([
                Markup.callbackButton(i18n.t('help_search_title'), 'helpsearch'),
                Markup.callbackButton(i18n.t('repeat_search'), query)
            ]),
        { columns: 1 }
    )
}

function createResultButtons(res, query) {
    return res.map((result) =>
        Markup.urlButton(
            `[${result.provider}] ${result.name}`,
            `${PLAYER_URL}?provider=${result.provider}&id=${result.id}&query=${encodeURIComponent(query)}`
        )
    )
}

module.exports = async ({ i18n, reply, replyWithChatAction, mixpanel }, defaultProviders, botType, text) => {
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
                [
                    Markup.callbackButton(i18n.t('help_search_title'), 'helpsearch'),
                    Markup.callbackButton(i18n.t('repeat_search'), query)
                ],
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
                createResultButtons(results, query)
                    .concat([
                        Markup.callbackButton(i18n.t('help_search_title'), 'helpsearch'),
                        Markup.callbackButton(i18n.t('repeat_search'), query)
                    ]),
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