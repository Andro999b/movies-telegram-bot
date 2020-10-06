const DataLifeProvider = require('./DataLifeProvider')
const superagent = require('superagent')
const urlencode = require('urlencode')
const videocdnembed = require('../utils/videocdnembed')

class KinogoProvider extends DataLifeProvider {
    constructor() {
        super('kinogo', {
            scope: 'div.shortstory',
            selectors: {
                id: {
                    selector: '.zagolovki>a:nth-last-child(1)',
                    transform: ($el) => urlencode($el.attr('href'))
                },
                name: '.zagolovki>a:nth-last-child(1)',
                image: {
                    selector: '.shortimg>div>a>img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '.shortstorytitle>h1',
                image: {
                    selector: '.fullimg>div>a>img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: 'ul.tabs',
                    transform: async ($el) => {
                        const onlcickAttr = $el.children().eq(1).attr('onclick')

                        let matches = onlcickAttr.match(/\/engine\/ajax\/player_vse_pc\.php\?string_name=\d+/)

                        if (matches.length == 0) return []

                        const iframeRes = await superagent
                            .get(`${this.config.baseUrl}${matches[0]}`)
                            .timeout(this.config.timeout)

                        matches = iframeRes.text.match(/https?[^\s"]+/)

                        if (matches.length == 0) return []

                        const playlist = await videocdnembed(matches[0])

                        return playlist.map((file, id) => ({ id, ...file}))
                    }
                },
                trailer: {
                    selector: 'video>source',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            }
        })
    }

    _getSiteEncoding() {
        return 'windows-1251'
    }
}

module.exports = KinogoProvider