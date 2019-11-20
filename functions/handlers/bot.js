
const makeResponse = require('../utils/makeResponse')
const providersService = require('../providers')
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const bot = new Telegraf(process.env.TOKEN)

const search = async (providers, ctx) => {
    const q = ctx.message.text
    const results = await providersService.search(providers, q)

    await ctx.reply(`Results for: "${q}"`, Extra.markup(Markup.inlineKeyboard(
        results.map((result) =>
            Markup.urlButton(
                result.name,
                `https://movies-player.web.app?provider=${result.provider}&id=${result.id}`
            )
        ), {
            columns: 1
        }
    )))
}

bot.command('start', (ctx) => ctx.reply(
    'Just type Movie, TV Show or Catroon name and i will try to find something for you'
))
bot.on('text', (ctx) => search(providersService.getProviders(), ctx))

providersService.getProviders().forEach((provider) => {
    bot.command(provider, (ctx) => search([provider], ctx))
})

module.exports = async (event) => {
    const body = JSON.parse(event.body)

    await bot.handleUpdate(body)

    return makeResponse({ input: event })
}