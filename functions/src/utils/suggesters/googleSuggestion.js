const superagent = require('superagent')
const cheerio = require('cheerio')

const { userAgent } = require('../../providersConfig')

module.exports = async (searchQuery) => { // eslint-disable-line
    try {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
        const res = await superagent
            .get(searchUrl)
            .set({
                'User-Agent': userAgent,
                'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3'
            })

        const $page = cheerio.load(res.text)
        const suggestion = $page('p.card-section a').eq(0).text()

        return suggestion ? [suggestion] : []
    } catch (e) {
        console.error(`Fail to fetch suggestion from google for: ${searchQuery}`, e)
    }

    return []
}