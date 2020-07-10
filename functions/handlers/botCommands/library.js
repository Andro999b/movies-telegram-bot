const { filmsLibrary } = require('../../library')
const doSearch = require('./functions/doSearch')
const Markup = require('telegraf/markup')

module.exports = (bot, defaultProviders, botType) => {
    const handler = async (ctx) => {
        const { i18n, reply, replyWithMediaGroup, replyWithChatAction, mixpanel, match } = ctx
        const query = match[1]

        await replyWithChatAction('typing')

        mixpanel.track('top', { query, bot: botType })

        const { results, params } = await filmsLibrary.top(query)
        const { page, pageSize, genreName, typeName, fromYear, toYear } = params

        const medias = results.map(({ id, year, rating, title, image }) => ({
            type: 'photo',
            media: image,
            caption: `${title} (${[year, rating].filter((it) => it).join(', ')})\n/lib${id}`
        }))

        await replyWithMediaGroup(medias)

        const newQuery = query.replace(/page[0-9]+/, '') + ` page${page + 1}`
        return reply(
            i18n.t(
                'top_results', 
                { 
                    from: (page - 1) * pageSize,
                    to: page * pageSize,
                    query: [genreName, typeName].filter((it) => it).join(' '),
                    years: [fromYear, toYear].filter((it) => it).join('-')
                }
            ), 
            Markup
                .inlineKeyboard([Markup.callbackButton(i18n.t('more'), `/top ${newQuery}`)])
                .extra()
        )
    }

    const libSearchHandler = async (ctx) => {
        const { reply, match } = ctx
        const id = match[1]

        const item = await filmsLibrary.getInfoById(id)

        if(item) {
            console.log(item);
            return doSearch(ctx, defaultProviders, botType, item.title)
        } else {
            return reply(i18n.t('no_results', { query: id }))
        }
    }

    if(botType == 'films') {
        bot.hears(/^\/lib([0-9]+)$/, libSearchHandler)
        bot.hears(/^\/top(.*)$/, handler)
        bot.action(/^\/top(.*)$/, async (ctx) => {
            await handler(ctx)
            await ctx.deleteMessage()
            return ctx.answerCbQuery()
        })
    }
}