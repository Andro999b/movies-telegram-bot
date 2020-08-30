const superagent = require('superagent')
const $ = require('cheerio')

module.exports = async (searchQuery) => {
    try {
        const res = await superagent
            .get(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`)
            .set({
                'User-Agent': 'Mozilla/5.0 Gecko/20100101 Firefox/78.0',
                'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3'
            })

        const $page = $(res.text)

        return $page.find('p.card-section a').eq(0).text()
    } catch (e) {
        console.error(`Fail to fetch suggestion for: ${searchQuery}`, e)
    }
}