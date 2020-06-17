const Extra = require('telegraf/extra')
const doSearch = require('./functions/doSearch')
const { base64UrlDecode } = require('../../utils/base64')

module.exports = (bot, providers, botType) => {
    bot.hears(/^\/(start|help)(.*)$/, async (ctx) => {
        const { i18n, reply, mixpanel, match } = ctx
        const command = match[1]

        // eslint-disable-next-line no-console
        console.log(match)

        if (command == 'start') {
            let query = match[2]

            mixpanel.people.set({ $created: new Date().toISOString() })

            if(query) {
                query = query.trim()
                if(query) {
                    mixpanel.track('alternativeLinks', { bot: botType })
                    
                    return doSearch(ctx, providers, botType, base64UrlDecode(query))
                } 
            }    

            mixpanel.track('register', { bot: botType })
        }

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
    })
}