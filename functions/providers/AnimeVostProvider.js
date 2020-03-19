const DataLifeProvider = require('./DataLifeProvider')
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
                        let matches

                        for(const item of $el.toArray()) {
                            if(item.children.length != 0) {
                                const script = item.children[0].data

                                matches = script.match(/var data = ([^;]+);/)

                                if(matches)  break
                            }
                        }

                        if(!matches) return []

                        const episodesDataStr = matches[1]

                        if(!episodesDataStr) return []

                        const episodesData = JSON.parse(episodesDataStr.replace(',}', '}'))

                        return Object.keys(episodesData)
                            .map((key, index) => {
                                const playerUrl = `https://play.roomfish.ru/${episodesData[key]}`
                                return {
                                    id: index,
                                    name: key,
                                    extractor: { type: 'animevost' },
                                    url: playerUrl
                                }
                            })
                    }
                }
            }
        })
    }
}

module.exports = AnimeVostProvider