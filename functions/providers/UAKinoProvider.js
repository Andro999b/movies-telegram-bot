const DataLifeProvider = require('./DataLIfeProvider')
const urlencode = require('urlencode')
const superagent = require('superagent')
const cheerio = require('cheerio')

class UAKinoProvider extends DataLifeProvider {
    constructor() {
        super('uakino', {
            scope: '.movie-item',
            selectors: {
                id: { selector: '.movie-title', transform: ($el) => urlencode($el.attr('href')) },
                name: '.movie-title',
                image: { selector: '.movie-img img', transform: ($el) => this.config.baseUrl + $el.attr('src') }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '.solototle',
                image: {
                    selector: '.film-poster img',
                    transform: ($el) => this.config.baseUrl + $el.attr('src')
                },
                files: {
                    transform: async ($el) => {
                        const $player = $el.find('#pre').first()
                        const files = await this.extractFiles($player)
                        return files.map((item, id) => ({ id, ...item }))
                    }
                }
            }
        })
    }

    async extractFiles($player) {
        if ($player.is('iframe')) {
            const src = $player.attr('src')
            const file = this.getFile(src)
            return file ? [file] : []
        } else if ($player.has('data-xfname')) {
            const id = $player.attr('data-news_id')

            const res = await superagent
                .get(`https://uakino.club/engine/ajax/playlists.php?news_id=${id}&xfield=playlist`)

            const { response } = JSON.parse(res.text)
            const $ = cheerio.load(response)

            const playlists = $('.playlists-lists li')
                .toArray()
                .reduce((acc, el) => {
                    const $el = $(el)
                    acc[$el.attr('data-id')] = $el.text()
                    return acc
                }, {})

            return $('.playlists-videos li')
                .toArray()
                .map((el) => {
                    const $el = $(el)
                    const src = $el.attr('data-file') 
                    const id = $el.attr('data-id') 
                    const name = $el.text()
                    const file = this.getFile(src)
                    return file && {
                        path: `${playlists[id]} / ${name}`,
                        name: `${playlists[id]} - ${name}`,
                        ...file
                    }
                })
                .filter((it) => it)
        }

        return []
    }

    getFile(src) {
        if (src.indexOf('ashdi.vip') != -1) {
            return {
                extractor: { type: 'ashdi' },
                manifestUrl: src
            }
        } else if (src.indexOf('tortuga.wtf') != -1) {
            return {
                extractor: { type: 'tortuga' },
                manifestUrl: src
            }
        // } else if (src.indexOf('vio.to') != -1) {
        //     return {
        //         extractor: { type: 'vio' },
        //         manifestUrl: src
        //     }
        // } else if (src.indexOf('sst.online') != -1) {
        //     return {
        //         extractor: { type: 'sst' },
        //         url: src
        //     }
        }
    }

    async _postProcessResultDetails(details) {
        // details.files = details.files || []

        // if(details.files.length == 1) {
        //     details.files[0].name = details.title
        // } 

        return details
    }
}

module.exports = UAKinoProvider