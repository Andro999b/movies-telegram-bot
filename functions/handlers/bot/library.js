const { filmsLibrary } = require('../../library')
const { doSimpleSearch } = require('./functions/doSearch')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')

module.exports = (bot, providers, botType) => {
    const topQueryHandler = async (ctx, query) => {
        const { i18n, track, replyWithMarkdown, replyWithChatAction } = ctx

        track('top', { query })

        await replyWithChatAction('typing')

        const { results, params } = await filmsLibrary.top(query)
        const { page, pageSize, genreName, typeName, countryName, fromYear, toYear } = params

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
                query: [typeName, genreName, countryName].filter((it) => it).join(' '),
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

    const topHandler = async (ctx) => {
        const { match } = ctx
        const query = match[1]

        return topQueryHandler(ctx, query)
    }

    const libHandler = async (ctx) => {
        const { i18n, track, reply, replyWithPhoto, deleteMessage, match } = ctx
        const id = match[1]

        const item = await filmsLibrary.getInfoById(id)

        try { 
            await deleteMessage() 
        } catch(e) {
            console.error('fail previous lib delete message', e)
        }

        if (item) {
            track('lib', { title: item.title })
            const { title, year, rating, url } = item
            return replyWithPhoto(
                item.image,
                Extra
                    .markup(Markup.inlineKeyboard([Markup.callbackButton(i18n.t('search'), `/libsearch${id}`)]))
                    .caption(`${title} - ${[year, rating].filter((it) => it).join(', ')}\n${url}`)
                    .markdown()
            )
        } else {
            track('lib_not_found', { libId: id })
            return reply(i18n.t('no_results', { query: id }))
        }
    }

    const libSearchHandler = async (ctx) => {
        const { match, track, reply, i18n, replyWithChatAction, answerCbQuery } = ctx
        const id = match[1]

        await replyWithChatAction('typing')

        const item = await filmsLibrary.getInfoById(id)

        if (item) {
            const { title } = item
            await doSimpleSearch(ctx, providers, title)
        } else {
            track('lib_not_found', { libId: id })
            await reply(i18n.t('no_results', { query: id }))
        }

        return answerCbQuery()
    }

    if (botType == 'films') {
        // top shortcuts
        bot.hears('/topmovies', (ctx) => topQueryHandler(ctx, 'фильм'))
        bot.hears('/topsearials', (ctx) => topQueryHandler(ctx, 'сериалы'))
        bot.hears('/topmult', (ctx) => topQueryHandler(ctx, 'мульт фильм'))
        bot.hears('/topmultsearials', (ctx) => topQueryHandler(ctx, 'мульт сериалы'))
        bot.hears('/toprussia', (ctx) => topQueryHandler(ctx, 'фильмроссия'))
        bot.hears('/toprussiasearial', (ctx) => topQueryHandler(ctx, 'сериалы россия'))
        bot.hears('/topcomedy', (ctx) => topQueryHandler(ctx, 'комедии'))
        bot.hears('/tophorror', (ctx) => topQueryHandler(ctx, 'ужас'))
        bot.hears('/toptriller', (ctx) => topQueryHandler(ctx, 'триллер'))
        bot.hears('/topdrama', (ctx) => topQueryHandler(ctx, 'драма'))
        bot.hears('/topdoc', (ctx) => topQueryHandler(ctx, 'документальный'))
        bot.hears('/topwar', (ctx) => topQueryHandler(ctx, 'военный'))
        bot.hears('/topaction', (ctx) => topQueryHandler(ctx, 'боевик'))
        bot.hears('/topdetective', (ctx) => topQueryHandler(ctx, 'детектив'))
        // top help
        bot.command('tophelp', ({ reply, track, i18n }) => {
            track('top_help')
            return reply(i18n.t('top_help'))
        })
        // lib
        bot.hears(/^\/lib([0-9]+)$/, libHandler)
        bot.action(/^\/libsearch([0-9]+)$/, libSearchHandler)
        // top
        bot.hears(/^\/top(.*)$/, topHandler)
        bot.action(/^\/top(.*)$/, async (ctx) => {
            await topHandler(ctx)
            try { 
                await ctx.deleteMessage() 
            } catch(e) {
                console.error('fail delete previous top page message', e)
            }
            return ctx.answerCbQuery()
        })
    }
}