const KinogoProvider = require('./KinogoProvider')
const superagent = require('superagent')
const $ = require('cheerio')

class KinogoDownloadsProvider extends KinogoProvider {
    constructor() {
        super()
        this.config.detailsSelectors.files = {
            selector: '#post_id',
            transform: async ($el) => {
                const newsId = $el.val()
                const res = await superagent
                    .get(`${this.config.baseUrl}/engine/ajax/cdn_download.php?news_id=${newsId}`)
                    .charset()
                    .timeout(this.config.timeout)

                const $downloads = $(res.text)
                return this._parseDownloads($downloads)
            }
        }
    }

    _parseDownloads($items) {
        let playlist = []
        let path
        let cache = []

        $items.each((_, item) => {
            const $item = $(item)
            if($item.hasClass('cdn_download_season')) {
                path = $item.text()
            } else if($item.hasClass('cdn_download_item')) {
                const $spans = $item.children('span')
                const name = $spans.first().text()
                const audio = `${$spans.eq(1).text()} ${$spans.eq(2).text()}`

                let fullName
                let file

                if(path) {
                    fullName = path + '/' + name
                } else {
                    fullName = name
                }

                if(cache[fullName] == null) {
                    file = {
                        name,
                        urls: []
                    }
                    if(path) file.path = path

                    cache[fullName] = file
                    playlist.push(file)
                } else {
                    file = cache[fullName]
                }

                $item.children('ul').first().find('li > a').each((_, link) => {
                    const $link = $(link)
                    file.urls.push({ 
                        audio,
                        quality: parseInt($link.text()),
                        url: $link.attr('href')
                    })  
                })             
            }
        })

        return playlist.reverse().map((file, index) => {
            file.urls = file.urls.sort((a, b) => b.quality - a.quality)
            file.id = index

            return file
        })
    }
}

module.exports = KinogoDownloadsProvider