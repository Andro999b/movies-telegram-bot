module.exports = (bot, botType) => {
    bot.action('helpsearch', async ({ i18n, reply, replyWithMediaGroup, answerCbQuery, mixpanel }) => {
        mixpanel.track('helpsearch', { bot: botType })
    
        await reply(i18n.t('help_search_text'))
        await replyWithMediaGroup([
            {
                type: 'photo',
                media: 'https://films-seach-bot-images.s3.eu-central-1.amazonaws.com/1.png'
            },
            {
                type: 'photo',
                media: 'https://films-seach-bot-images.s3.eu-central-1.amazonaws.com/2.png'
            },
            {
                type: 'photo',
                media: 'https://films-seach-bot-images.s3.eu-central-1.amazonaws.com/3.png'
            },
        ])
        await answerCbQuery()
    })
}