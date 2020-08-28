const HELP_IMAGES = process.env.HELP_IMAGES ? process.env.HELP_IMAGES.split(',') : []

module.exports = (bot) => {
    bot.command('helpsearch', async ({ i18n, track, reply, replyWithMediaGroup, answerCbQuery }) => {
        track('helpsearch')

        await reply(i18n.t('help_search_text'))
        await replyWithMediaGroup(HELP_IMAGES.map((url) => ({
            type: 'photo',
            media: url
        })))
        return answerCbQuery()
    })
}