import extractSearchEngineQuery from '../../../utils/extractSearchEngineQuery'
import providersService from '../../../providers'
import getQueryAndProviders from './getQueryAndProviders'
import { Markup } from 'telegraf'
import suggesters from '../../../utils/suggesters'

const BOT_TYPE = process.env.BOT_TYPE
const MAX_UNFOLD_RESULTS = process.env.MAX_UNFOLD_RESULTS || 3
const STAGE = process.env.STAGE || 'prod'
const MAX_QUERY_LENGTH = 63
const MAX_QUERY_LENTH_WITH_PROVIDER = 50
const PLAYER_URL = process.env.PLAYER_URL
const MAX_RESULTS_PER_MESSAGE = 10

const getResultsKeyboad = (providersResults, query, i18n) => {
    return Markup.inlineKeyboard(
        providersResults
            .sort((a, b) => a.length - b.length)
            .map((res) => {
                if (res.length > MAX_UNFOLD_RESULTS) {
                    const provider = res[0].provider
                    return [
                        Markup.button.callback(
                            i18n.t('more_results', { count: res.length, provider }),
                            `#${provider}${getQueryAndProviders.PAGE_SEPARATOR}1 ${query}`
                        )
                    ]
                } else {
                    return createResultButtons(res, query)
                }
            })
            .reduce((acc, items) => acc.concat(items), []),
        { columns: 1 }
    )
}

const createResultButtons = (res, query) => {
    return res.map((result) =>
        Markup.button.url(
            `[${result.provider}] ${result.name}`,
            `${PLAYER_URL}?provider=${result.provider}&id=${result.id}&query=${encodeURIComponent(query)}${STAGE == 'dev' ? '&dev' : ''}`
        )
    )
}

const getNoResults = async (ctx, providers, query) => {
    const suggeter = suggesters[BOT_TYPE]

    if (!suggeter) {
        return ctx.reply(i18n.t('no_results', { query }))
    }

    const suggestions = await suggeter(query)
    const { i18n, track } = ctx

    track('no_results', { query, providers, suggestions })

    if (suggestions && suggestions.length) {
        const tooLong = suggestions.some((suggestion) =>
            Buffer.byteLength(suggestion, 'utf-8') > MAX_QUERY_LENGTH
        )
        
        if (tooLong) {
            return ctx.reply(
                i18n.t('no_results', { query }) + '\n' +
                i18n.t('spell_check_too_long', { suggestion: suggestions.join(',') })
            )
        }

        return ctx.reply(
            i18n.t('no_results', { query }) + '\n' + i18n.t('spell_check'),
            Markup.inlineKeyboard([
                ...suggestions.map((suggestion) => Markup.button.callback(suggestion, suggestion)),
                Markup.button.callback(i18n.t('repeat_search'), query)
            ], { columns: 1 })
        )
    }

    if (Buffer.byteLength(query, 'utf-8') > MAX_QUERY_LENGTH) {
        return ctx.reply(i18n.t('no_results', { query }))
    }

    return ctx.reply(
        i18n.t('no_results', { query }),
        Markup.inlineKeyboard([
            Markup.button.callback(i18n.t('repeat_search'), query)
        ])
    )
}

const doTextSearch = async (ctx, providers, query, page) => {
    const { i18n, track } = ctx

    let providersResults = await Promise.all(providers.map((providerName) =>
        providersService.searchOne(providerName, query)
    ))

    providersResults = providersResults.filter((res) => res && res.length)

    // no results
    if (!providersResults.length) {
        return getNoResults(ctx, providers, query)
    }

    const resultsCount = providersResults.reduce((acc, items) => acc + items.length, 0)
    track('search', { query, providers, resultsCount })

    const replySingleProvider = (results) => {
        const provider = results[0].provider
        if (Buffer.byteLength(query, 'utf8') > MAX_QUERY_LENTH_WITH_PROVIDER) {
            return ctx.reply(
                i18n.t('provider_results', { query, provider }),
                Markup.inlineKeyboard(createResultButtons(results, query), { columns: 1 })
            )
        }

        const from = (page - 1) * MAX_RESULTS_PER_MESSAGE
        const to = page * MAX_RESULTS_PER_MESSAGE
        const chunk = results.slice(from, to)
        const buttons = createResultButtons(chunk, query)

        if (to < results.length) {
            buttons.push(Markup.button.callback(
                i18n.t('next_page'),
                `#${provider}${getQueryAndProviders.PAGE_SEPARATOR}${page + 1} ${query}`
            ))
        }

        return ctx.reply(
            i18n.t('provider_results', { query, provider }),
            Markup.inlineKeyboard(buttons, { columns: 1 })
        )
    }

    // return single provider results
    if (providersResults.length == 1) {
        const results = providersResults[0]
        return replySingleProvider(results)
    } else if (Buffer.byteLength(query, 'utf8') > MAX_QUERY_LENTH_WITH_PROVIDER) {
        return Promise.all(providersResults.map(replySingleProvider))
    } else {
        return ctx.reply(
            i18n.t('results', { query }),
            getResultsKeyboad(providersResults, query, i18n)
        )
    }
}

// Check ukrainan lanuage letters
// const doCheckUkraine = async (ctx, query) => {
//     if(BOT_TYPE == 'ua') return

//     const { i18n, track } = ctx
//     if(/[іІїЇєЄ]+/.test(query)) {
//         track('ukraine_detected')
//         await ctx.reply(i18n.t('ukraine_detected'))
//     }
// }

const doSearch = async (ctx, defaultProviders, text) => {
    const { i18n, track } = ctx

    await ctx.replyWithChatAction('typing')

    let { query, providers, page } = getQueryAndProviders(text, defaultProviders)

    query = await extractSearchEngineQuery(query)

    if (!query) {
        track('no_results', { query, providers })
        return ctx.reply(i18n.t('no_results', { query }))// do nothing in case if user send link
    }

    // await doCheckUkraine(ctx, query)

    return doTextSearch(ctx, providers, query, page)
}

export default doSearch
export const doSimpleSearch = doTextSearch