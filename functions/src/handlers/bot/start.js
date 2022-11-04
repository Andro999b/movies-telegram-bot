import doSearch from './functions/doSearch'
import { base64UrlDecode } from '../../utils/base64'

export default (bot, providers) => {

    const renderHello = (ctx) => {
        return ctx.replyWithHTML(
            ctx.i18n.t(
                'start',
                {
                    sample: providers[0],
                    providers: providers.map((it) => ` - ${it}`).join('\n')
                }
            )
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
                        console.error(`Fail proccess start payload ${query}`, e)
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