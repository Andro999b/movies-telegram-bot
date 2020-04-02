const Provider = require('./Provider')
const { extractNumber, extractString } = require('../utils/extractScriptVariable')
const convertPlayerJSPlaylist = require('../utils/convertPlayerJSPlaylist')
const urlencode = require('urlencode')
const superagent = require('superagent')

class KinovodProvider extends Provider {
    constructor() {
        super('kinovod', {
            scope: '.items>.item',
            selectors: {
                id: { 
                    selector: 'a', 
                    transform: ($el) => urlencode($el.attr('href')) 
                },
                name: '.title',
                image: {
                    selector: 'a img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '.content',
            detailsSelectors: {
                title: '#movie>h1',
                image: {
                    selector: '.poster img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: 'script',
                    transform: async ($el) => {
                        const targetScripts = $el
                            .filter(':not([src])')
                            .toArray()
                            .map(el => el.children[0].data)
                            .filter(text => text.startsWith('\nvar MOVIE_ID'))

                        if(targetScripts.length != 1)
                            return []

                        const targetScript = targetScripts[0]
                        const movieId = extractNumber(targetScript, 'MOVIE_ID')
                        const vodHash = extractString(targetScript, 'VOD_HASH')
                        const vodTime = extractString(targetScript, 'VOD_TIME')
                        const identifier = extractString(targetScript, 'IDENTIFIER')

                        const url = `${this.config.baseUrl}/vod/${movieId}?identifier=${identifier}&st=${vodHash}&e=${vodTime}`

                        const res = await superagent.get(url)

                        const playerJsPlaylist = res.text.split('|')[1]

                        return convertPlayerJSPlaylist(playerJsPlaylist)
                            .map((item, id) => ({
                                id, ...item
                            }))
                    }
                }
            }
        })
    }

    getSearchUrl(query) {
        return `${this.config.searchUrl}?query=${encodeURIComponent(query)}`
    }
}

module.exports = KinovodProvider