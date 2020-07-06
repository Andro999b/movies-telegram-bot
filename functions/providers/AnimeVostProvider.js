const DataLifeProvider = require('./DataLifeProvider')
const { extractObject } = require('../utils/extractScriptVariable')
const urlencode = require('urlencode')

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

                        for(const item of $el.toArray()) {
                            if(item.children.length != 0) {
                                const script = item.children[0].data

                                episodesData = extractObject(script, 'data')

                                if(episodesData)  break
                            }
                        }

                        if(!episodesData) return []

                        return Object.keys(episodesData)
                            .map((key, index) => {
                                const playerUrl = `https://play.roomfish.ru/${episodesData[key]}`
                                return {
                                    id: index,
                                    name: key,
                                    urls: [{ 
                                        url: playerUrl,
                                        extractor: { type: 'animevost' }
                                    }]
                                }
                            })
                    }
                }
            }
        })
    }
}

module.exports = AnimeVostProvider