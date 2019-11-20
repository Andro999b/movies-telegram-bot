
const makeResponse = require('../utils/makeResponse')
const providersService = require('../providers')
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const bot = new Telegraf(process.env.TOKEN)

const search = async (providers, ctx) => {
    const q = ctx.message.text
    const results = await providersService.search(providers, q)

    await ctx.reply('There what i found', Extra.markup(Markup.keyboard(
        results.map((result) => Markup.switchToCurrentChatButton(result.name, `info:${result.provider}:${result.id}`))
    )))
}

bot.on('text', (ctx) => search(providersService.getProviders(), ctx))
bot.command('start', (ctx) => ctx.reply('Just type Movie, TV Show or Catroon name and i will try to find something for you'))
bot.inlineQuery(/info:/, (ctx) => console.log(ctx.message))

providersService.getProviders().forEach((provider) => {
    bot.command(provider, (ctx) => search([provider], ctx))
})

module.exports = async (event) => {
    const body = JSON.parse(event.body)

    await bot.handleUpdate(body)

    return makeResponse({ input: event })
}