const crawler = require('../crawler')
const { userAgent } = require('../../providersConfig')

module.exports = async (searchQuery) => {
    try {
        const url = `https://kinobaza.com.ua/search?q=${encodeURIComponent(searchQuery)}`

        const results = await crawler.get(url)
            .scope('[itemtype="http://schema.org/Movie"]')
            .headers({
                'User-Agent': userAgent
            })
            .set({
                title: '[itemprop="name"]'
            })
            .limit(10)
            .gather()

        return results.map(({ title }) =>  title)
    } catch(e) {
        console.error(`Fail to fetch suggestion from kinobaza.com.ua for: ${searchQuery}`, e)
    }
    
    return []
}