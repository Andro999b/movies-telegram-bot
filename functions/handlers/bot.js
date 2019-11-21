
const makeResponse = require('../utils/makeResponse')
const providersService = require('../providers')
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const bot = new Telegraf(process.env.TOKEN)

const search = async (providers, q, ctx) => {
    const results = await providersService.search(providers, q)

    await ctx.reply(`Results for: "${q}"`, Extra.markup(Markup.inlineKeyboard(
        results.map((result) =>
            Markup.urlButton(
                result.name,
                `${process.env.PLAYER_URL}?provider=${result.provider}&id=${result.id}`
            )
        ), {
            columns: 1
        }
    )))
}

bot.command('start', (ctx) => ctx.reply(
    'Just type Movie, TV Show or Cartoon name and i will try to find something for you'
))
bot.command('providers', (ctx) => ctx.reply(providersService.getProviders().join(', ')))
providersService.getProviders().forEach((provider) => 
    bot.command(provider, async (ctx) => {
        //cut command
        const q = ctx.message.text.substr(provider.length + 2)
        await search([provider], q, ctx)
    })
)
bot.on('text', (ctx) => search(['seasonvar', 'kinogo'], ctx.message.text, ctx))

module.exports = async (event) => {
    const body = JSON.parse(event.body)

    await bot.handleUpdate(body)

    return makeResponse({ input: event })
}