const doSearch = require('./functions/doSearch')
const getQueryAndProviders = require('./functions/getQueryAndProviders')
const providersService = require('../../providers')
const Markup = require('telegraf/markup')
const uuid = require('uuid')

const PLAYER_URL = process.env.PLAYER_URL

module.exports = (bot, defaultProviders, inlineProviders, botType) => {
    bot.on('callback_query', async (ctx) => {
        await doSearch(ctx, defaultProviders, botType, ctx.callbackQuery.data)
        return ctx.answerCbQuery()
    })
    bot.on('text', async (ctx) => doSearch(ctx, defaultProviders, botType, ctx.message.text))
    bot.on('inline_query', async ({ i18n, inlineQuery, answerInlineQuery }) => {
        const { query, providers } = getQueryAndProviders(inlineQuery.query, inlineProviders)
    
        const results = await providersService.search(providers, query)
    
        return answerInlineQuery(results.map(({ name, image, provider, id }) => ({
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
}