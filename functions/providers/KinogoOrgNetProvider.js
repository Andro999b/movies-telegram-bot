const DataLifeProvider = require('./DataLifeProvider')
const superagent = require('superagent')
const urlencode = require('urlencode')

const { extractObjectProperty, extractStringProperty, extractArrayProperty, extractJSStringProperty } = require('../utils/extractScriptVariable')

class KinogoProvider extends DataLifeProvider {
    constructor() {
        super('kinogo', {
            scope: 'div.kino-item',
            selectors: {
                id: {
                    selector: '.kino-title>a',
                    transform: ($el) => urlencode($el.attr('href'))
                },
                name: '.kino-title>a',
                image: {
                    selector: '.kino-img>img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '.kino-item>.kino-title-full>h1',
                image: {
                    selector: '.kino-item>.kino-inner-full>.kino-text>.kino-desc>.kino-desc__img-box>img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: '#playerPreroll>iframe',
                    transform: async ($el) => {
                        const iframeres = await superagent.get($el.attr('src'))

                        const seasons = extractArrayProperty(iframeres.text, "seasons")
                        if(seasons) {
                            const files = []

                            let id = 0
                            seasons.forEach(({season, episodes}) => {
                                episodes.forEach(({ episode, hls }) => {
                                    files.push({
                                        id: id++,
                                        name: `Season ${season}/Episode ${episode}`,
                                        urls: [{url: hls}]
                                    })
                                })    
                            })

                            return files
                        }

                        const url = extractJSStringProperty(iframeres.text, "hls")
                        if(url) {
                            return [{
                                id: 0,
                                urls: [{ url }]
                            }]
                        }

                        return []
                        // const onlcickAttr = $el.children().eq(1).attr('onclick')

                        // let matches = onlcickAttr.match(/\/engine\/ajax\/player_vse_pc\.php\?string_name=\d+/)

                        // if (!matches || matches.length == 0) 
                        //     return this._extractFallback($root.find('#1212'))

                        // try {
                        //     const iframeRes = await superagent
                        //         .get(`${this.config.baseUrl}${matches[0]}`)
                        //         .timeout(this.config.infoTimeout)

                        //     matches = iframeRes.text.match(/https?[^\s"]+/)

                        //     if (matches.length == 0) return []

                        //     const playlist = await videocdnembed(matches[0], this.config.infoTimeout / 2)

                        //     return playlist.map((file, id) => ({ id, ...file }))
                        // } catch(e) {
                        //     console.error('Kinogo get files failed with', e)
                        //     return this._extractFallback($root.find('#1212'))
                        // }
                    }
                }
            }
        })
    }
}

module.exports = KinogoProvider