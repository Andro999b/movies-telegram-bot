const DataLifeProvider = require('./DataLifeProvider')
const $ = require('cheerio')
const urlencode = require('urlencode')

class AnidubProvider extends DataLifeProvider {
    constructor() {
        super('anidub', {
            scope: '.th-item',
            selectors: {
                id: { selector: '.th-in', transform: ($el) => urlencode($el.attr('href')) },
                name: '.th-in > .th-title',
                image: {
                    selector: '.th-img > img',
                    transform: ($el) => this._absoluteUrl($el.attr('data-src'))
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '.fright.fx-1 h1',
                image: {
                    selector: '.img-box img',
                    transform: ($el) => this._absoluteUrl($el.attr('data-src'))
                },
                files: {
                    selector: '.video-box:nth-child(3) .series-tab',
                    transform: ($el) => $el.children()
                        .toArray()
                        .map((el) => $(el))
                        .filter(($el) => $el.attr('data').includes('sibnet'))
                        .map(($el,id) => {
                            return {
                                id,
                                name: $el.text(),
                                urls: [{
                                    url: $el.attr('data'),
                                    extractor: { type: 'sibnetmp4' }
                                }]
                            }
                        })
                },
                trailer: {
                    selector: '.video-box .series-tab',
                    transform: ($el) => $el.eq(0).children()
                        .toArray()
                        .map((el) => $(el).attr('data'))
                        .filter((data) => data && data.includes('youtube'))[0]
                }
            }
        })
    }
}

module.exports = AnidubProvider