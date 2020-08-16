const Extra = require('telegraf/extra')
const doSearch = require('./functions/doSearch')
const { base64UrlDecode } = require('../../utils/base64')

module.exports = (bot, providers) => {

    function renderHello({ i18n, reply }) {
        return reply(
            i18n.t(
                'start',
                {
                    sample: providers[0],
                    providers: providers.map((it) => ` - ${it}`).join('\n')
                }
            ),
            Extra.HTML()
        )
    }

    bot.start(async (ctx) => {
        const { startPayload, track } = ctx

        track('start', { startPayload })

        if (startPayload) {
            query = startPayload.trim()
            if (query) {
                return doSearch(ctx, providers, base64UrlDecode(query))
            }
        }

        return renderHello(ctx)
    })

    bot.help(async (ctx) => {
        ctx.track('help')
        return renderHello(ctx)
    })
}