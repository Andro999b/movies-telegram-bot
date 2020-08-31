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
        let referer = null

        if (startPayload) {
            let query = startPayload.trim()
            switch (query) {
                case 'botostore':
                    referer = query
                    break
                default:
                    try {
                        const startPayload = base64UrlDecode(query)
                        track('start', { startPayload })
                        return doSearch(ctx, providers, base64UrlDecode(query))
                    } catch (e) {
                        console.error(`Fail proccess start peayload ${query}`, e)
                    }
            }
        }

        track('start', { referer })

        return renderHello(ctx)
    })

    bot.help(async (ctx) => {
        ctx.track('help')
        return renderHello(ctx)
    })
}