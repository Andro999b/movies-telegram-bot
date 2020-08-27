const DataLifeProvider = require('./DataLifeProvider')
const { extractObject, extractStringPropery } = require('../utils/extractScriptVariable')
const urlencode = require('urlencode')
const superagent = require('superagent')
const convertPlayerJSPlaylist = require('../utils/convertPlayerJSPlaylist')

class AnimeVostProvider extends DataLifeProvider {
    constructor() {
        super('animevost', {
            scope: '.shortstory',
            selectors: {
                id: { selector: '.shortstoryHead a', transform: ($el) => urlencode($el.attr('href')) },
                name: '.shortstoryHead a',
                image: {
                    selector: '.shortstoryContent div > a > img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '.shortstoryHead h1',
                image: {
                    selector: '.imgRadius',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: 'script',
                    transform: ($el) => {
                        let episodesData

                        for (const item of $el.toArray()) {
                            if (item.children.length != 0) {
                                const script = item.children[0].data

                                episodesData = extractObject(script, 'data')

                                if (episodesData) break
                            }
                        }

                        if (!episodesData) return []

                        return Object.keys(episodesData)
                            .map((key, index) => {
                                const playerUrl = `https://play.roomfish.ru/${episodesData[key]}`
                                return {
                                    id: index,
                                    name: key,
                                    asyncSource: urlencode(playerUrl)
                                }
                            })
                    }
                }
            }
        })
    }

    async getSource(resultsId, sourceId) {
        const url = decodeURIComponent(sourceId)
        const targetUrl = url.startsWith('//') ? 'https:' + url : url

        const siteRes = await superagent
            .get(targetUrl)
            .timeout(5000)
            .disableTLSCerts()

        const playerJsPlaylist = extractStringPropery(siteRes.text, 'file')

        return convertPlayerJSPlaylist(playerJsPlaylist)[0]
    }
}

module.exports = AnimeVostProvider