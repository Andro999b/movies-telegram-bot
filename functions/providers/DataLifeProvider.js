const Provider = require('./Provider')
const superagent = require('superagent')
const urlencode = require('urlencode')
const cheerio = require('cheerio')

require('superagent-charset')(superagent)

class DataLifeProvider extends Provider {
    async search(query) {
        const { searchUrl, baseUrl, timeout } = this.config

        const res = await superagent
            .post(searchUrl)
            .type('form')
            .buffer(true)
            .charset()
            .timeout(timeout)
            .send({ 
                query
            })

        const $ = cheerio.load(res.text, { decodeEntities: false })

        return $('a>.searchheading')
            .toArray()
            .map((el) => {
                const $el = $(el)
                const infoUrl = $el.parent().attr('href')
                const image = $el.find('img').attr('src')

                const item = {
                    id: urlencode(infoUrl),
                    infoUrl,
                    provider: this.getName(),
                    name: $el.html()
                        .replace(/(<br>)+/g, ' ')
                        .replace(/<[^>]*>?/g, '')
                }

                if(image)
                    item.image = image.startsWith('/') ? baseUrl + image : image

                return item
            })
    }
}

module.exports = DataLifeProvider