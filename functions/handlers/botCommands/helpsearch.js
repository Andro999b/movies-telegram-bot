const HELP_IMAGES = process.env.HELP_IMAGES ? process.env.HELP_IMAGES.split(',') : []

module.exports = (bot, botType) => {
    bot.action('helpsearch', async ({ i18n, reply, replyWithMediaGroup, answerCbQuery }) => {
        await reply(i18n.t('help_search_text'))
        await replyWithMediaGroup(HELP_IMAGES.map(url => ({
            type: 'photo',
            media: url
        })))
        return answerCbQuery()
    })
}