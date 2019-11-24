
const makeResponse = require('../utils/makeResponse')
const providersService = require('../providers')
const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')
const session = require('telegraf/session')

const DEFAULT_PROVIDERS = ['seasonvar', 'kinogo']

const bot = new Telegraf(process.env.TOKEN)
bot.use(session())
bot.command('start', (ctx) => ctx.reply(
    'Just type Movie, TV Show or Cartoon name and i will try to find something for you'
))
bot.command('providers', (ctx) => ctx.reply(
    'Avalaible search providers',
    Markup.inlineKeyboard(
        providersService.getProviders().map((provider) =>
            Markup.callbackButton(provider, provider)
        ).concat(
            Markup.callbackButton('default', 'default')
        )
    ).resize().oneTime().extra()
))
providersService.getProviders().forEach((provider) =>
    bot.action(provider, async (ctx) => {
        ctx.session.provider = provider
        await ctx.answerCbQuery(`${provider} will be used for next search`)
    })
)
bot.action('default', async (ctx) => {
    ctx.session.provider = null
    await ctx.answerCbQuery('Default providers will be used for next search')
})
bot.on('text', async (ctx) => {
    const provider = ctx.session.provider
    ctx.session.provider = null

    const providers = provider ? [provider] : DEFAULT_PROVIDERS

    await ctx.replyWithChatAction('typing')

    const q = ctx.message.text
    const results = await providersService.search(providers, q)

    if(!results.length)
        return await ctx.reply(`No results for: "${q}"`)

    await ctx.reply(
        `📽 Results for: "${q}"`,
        Markup.inlineKeyboard(
            results.map((result) =>
                Markup.urlButton(
                    result.name,
                    `${process.env.PLAYER_URL}?provider=${result.provider}&id=${result.id}`
                )
            ),
            { columns: 1 }
        ).extra()
    )
})

module.exports = async (event) => {
    const body = JSON.parse(event.body)

    await bot.handleUpdate(body)

    return makeResponse({ input: event })
}