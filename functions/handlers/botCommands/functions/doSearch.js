
const extractSearchEngineQuery = require('../../../utils/extractSearchEngineQuery')
const providersService = require('../../../providers')
const getQueryAndProviders = require('./getQueryAndProviders')
const Markup = require('telegraf/markup')
const suggestions = require('../../../utils/suggestions')

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



async function getNoResults({ reply, i18n }, query, botType) {
    let text = i18n.t('no_results', { query })
    let btns = [
        Markup.callbackButton(i18n.t('help_search_title'), 'helpsearch'),
        Markup.callbackButton(i18n.t('repeat_search'), query)
    ]

    const correctedName = await suggestions(query)
    
    if(correctedName) {
        text += '\n' + i18n.t('spell_check')
        btns.unshift(Markup.callbackButton(correctedName, correctedName))
    } 

    return reply(
        text,
        Markup.inlineKeyboard(btns, { columns: 1 }).extra()
    )
}

async function doSimpleSearch(ctx, providers, botType, query) {
    const { i18n, reply } = ctx

    let providersResults = await Promise.all(providers.map((providerName) =>
        providersService.searchOne(providerName, query)
    ))

    providersResults = providersResults.filter((res) => res && res.length)

    // no results
    if (!providersResults.length) {
        return getNoResults(ctx, query, botType)
    }

    // retur single provider results
    if (providersResults.length == 1) {
        const results = providersResults[0]
        const provider = results[0].provider
        return reply(
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
    }
    //return multiple provders results
    else {
        return reply(
            i18n.t('results', { query }),
            getResultsKeyboad(providersResults, query, i18n).extra()
        )
    }
}

async function doSearch(ctx, defaultProviders, botType, text) {
    const { i18n, reply, replyWithChatAction } = ctx

    await replyWithChatAction('typing')

    let { query, providers } = getQueryAndProviders(text, defaultProviders)

    // check link
    const parts = query.match(/http?s:\/\/[^\s]+/)

    if (parts && parts.length > 0) {
        const searchEngineQuery = await extractSearchEngineQuery(parts[0])

        if (searchEngineQuery) query = searchEngineQuery
        else return reply(i18n.t('no_results', { query }))// do nothing in case if user send link
    }
    // check link ends

    return doSimpleSearch(ctx, providers, botType, query)
}

module.exports = doSearch
module.exports.doSimpleSearch = doSimpleSearch