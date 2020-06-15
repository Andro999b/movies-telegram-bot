const Extra = require('telegraf/extra')
const doSearch = require('./functions/doSearch')
const { base64UrlDecode } = require('../../utils/base64')

module.exports = (bot, providers, botType) => {
    bot.hears(/^\/(start|help)(.*)$/, async (ctx) => {
        const { i18n, reply, mixpanel, match } = ctx
        const command = match[1]

        console.log(match);

        if (command == 'start') {
            let query = match[2]

            if(query) {
                query = query.trim()
                if(query) {
                    return doSearch(ctx, providers, botType, base64UrlDecode(query))
                } 
            }    

            mixpanel.track('register', { bot: botType })
            mixpanel.people.set({ $created: new Date().toISOString() })
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