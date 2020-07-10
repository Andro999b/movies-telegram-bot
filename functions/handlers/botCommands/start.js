const Extra = require('telegraf/extra')
const doSearch = require('./functions/doSearch')
const { base64UrlDecode } = require('../../utils/base64')

module.exports = (bot, providers, botType) => {

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
        const { mixpanel, startPayload } = ctx

        mixpanel.people.set({ $created: new Date().toISOString() })

        if (startPayload) {
            query = startPayload.trim()
            if (query) {
                mixpanel.track('alternativeLinks', { bot: botType, query })

                return doSearch(ctx, providers, botType, base64UrlDecode(query))
            }
        }

        mixpanel.track('register', { bot: botType })

        return renderHello(ctx)
    })

    bot.help(async (ctx) => {
        const { mixpanel } = ctx

        mixpanel.people.set({ $created: new Date().toISOString() })

        mixpanel.track('register', { bot: botType })

        return renderHello(ctx)
    })
}