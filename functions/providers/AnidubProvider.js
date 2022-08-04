const DataLifeProvider = require('./DataLifeProvider')
const cheerio = require('cheerio')
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
                    selector: '.video-box .series-tab span',
                    transform: ($el) => $el
                        .toArray()
                        .filter((el) => el.attribs['data'].includes('video.sibnet.ru'))
                        .map((el, id) => {
                            return {
                                id,
                                name: cheerio.text(el),
                                urls: [{
                                    url: $el.attr('data'),
                                    extractor: { type: 'sibnetmp4' }
                                }]
                            }
                        })
                },
                trailer: {
                    selector: '.video-box .series-tab',
                    transform: ($el) => $el.first().children()
                        .toArray()
                        .map((el) => cheerio.load(el).root().attr('data'))
                        .filter((data) => data && data.includes('youtube'))[0]
                }
            }
        })
    }
}

module.exports = AnidubProvider