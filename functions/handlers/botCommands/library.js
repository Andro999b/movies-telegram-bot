const { filmsLibrary } = require('../../library')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')

module.exports = (bot, defaultProviders, botType) => {
    const handler = async (ctx) => {
        const { i18n, replyWithMarkdown, replyWithChatAction, mixpanel, match } = ctx
        const query = match[1]

        await replyWithChatAction('typing')

        mixpanel.track('top', { query, bot: botType })

        const { results, params } = await filmsLibrary.top(query)
        const { page, pageSize, genreName, typeName, fromYear, toYear } = params


        const content = results
            .map(({ id, year, rating, title }) => ({
                text: `${title} - ${[year, rating].filter((it) => it).join(', ')}`,
                command: `/lib${id}`
            }))
            .map(({ text, command }) => `● ${text} (${command})`)
            .join('\n')

        const navigation = []

        if(page > 1) {
            navigation.push({
                caption: i18n.t('prev'),
                query: query.replace(/page[0-9]+/, '') + ` page${page - 1}`
            })
        }

        navigation.push({
            caption: i18n.t('next'),
            query: query.replace(/page[0-9]+/, '') + ` page${page + 1}`
        })

        const title = i18n.t(
            'top_results',
            {
                from: (page - 1) * pageSize,
                to: page * pageSize,
                query: [genreName, typeName].filter((it) => it).join(' '),
                years: [fromYear, toYear].filter((it) => it).join('-')
            }
        )

        return replyWithMarkdown(
            `${title}\n${content}`,
            Markup
                .inlineKeyboard(
                    navigation.map(({ caption, query }) => Markup.callbackButton(caption, `/top ${query}`))
                )       
                .extra()
        )
    }

    const libSearchHandler = async (ctx) => {
        const { i18n, reply, replyWithPhoto, deleteMessage, match } = ctx
        const id = match[1]

        const item = await filmsLibrary.getInfoById(id)

        await deleteMessage()

        if (item) {
            const { title, year, rating, url } = item
            return replyWithPhoto(
                item.image,
                Extra
                    .markup(Markup.inlineKeyboard([Markup.callbackButton(i18n.t('search'), title)]))
                    .caption(`${title} - ${[year, rating].filter((it) => it).join(', ')}\n${url}`)
                    .markdown()
            )
        } else {
            return reply(i18n.t('no_results', { query: id }))
        }
    }

    if (botType == 'films') {
        bot.hears(/^\/lib([0-9]+)$/, libSearchHandler)
        bot.hears(/^\/top(.*)$/, handler)
        bot.action(/^\/top(.*)$/, async (ctx) => {
            await handler(ctx)
            await ctx.deleteMessage()
            return ctx.answerCbQuery()
        })
    }
}