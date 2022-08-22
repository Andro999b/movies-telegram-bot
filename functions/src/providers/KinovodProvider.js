const Provider = require('./Provider')
const { extractNumber, extractString } = require('../utils/extractScriptVariable')
const convertPlayerJSPlaylist = require('../utils/convertPlayerJSPlaylist')
const urlencode = require('urlencode')
const superagent = require('superagent')
const $ = require('cheerio').default

class KinovodProvider extends Provider {
    constructor() {
        super('kinovod', {
            scope: '.items>.item',
            selectors: {
                id: {
                    selector: '>a',
                    transform: ($el) => urlencode($el.attr('href'))
                },
                name: '>.info>.title>a',
                image: {
                    selector: '>a>img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '.content',
            detailsSelectors: {
                title: '#movie>div>h1',
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
                            .map((el) => el.children[0].data)
                            .filter((text) => text.startsWith('\nvar MOVIE_ID'))

                        if(targetScripts.length != 1)
                            return []

                        const targetScript = targetScripts[0]
                        const movieId = extractNumber(targetScript, 'MOVIE_ID')
                        const playerCuid = extractString(targetScript, 'PLAYER_CUID')
                        const identifier = extractString(targetScript, 'IDENTIFIER')

                        let res
                        let url = `${this.config.baseUrl}/user_data?page=movie&movie_id=${movieId}&cuid=${playerCuid}&device=DESKTOP&_=${Date.now()}`

                        try{
                            res = await superagent
                                .get(url)
                                .timeout(this.config.timeout)
                        } catch(e) {
                            console.error(e)
                            return []
                        }

                        const resJson = JSON.parse(res.text)
                        const vodHash = resJson.vod_hash
                        const vodTime = resJson.vod_time

                        url = `${this.config.baseUrl}/vod/${movieId}?identifier=${identifier}&player_type=new&file_type=hls&st=${vodHash}&e=${vodTime}&_=${Date.now()}`

                        try{
                            res = await superagent
                                .get(url)
                                .timeout(this.config.timeout)
                        } catch(e) {
                            return []
                        }

                        const playerJsPlaylist = res.text.split('|')[1]

                        return convertPlayerJSPlaylist(playerJsPlaylist)
                            .map((item, id) => ({
                                id, ...item
                            }))
                    }
                },
                trailer: {
                    selector: 'iframe.embed-responsive-item',
                    transform: ($el) => {
                        const src = $el.toArray()
                            .map((el) => $(el).attr('src'))
                            .find((src) => src.search('youtube') != 1)

                        return src
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