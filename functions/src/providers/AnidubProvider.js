const Provider = require('./DataLifeProvider')
const cheerio = require('cheerio')
const urlencode = require('urlencode')

class AnidubProvider extends Provider {
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
                            const url = $el.attr('data')
                            if (url.indexOf('sibnet') != -1) {
                                return {
                                    id,
                                    name: cheerio.load(el).text(),
                                    urls: [{
                                        url,
                                        extractor: { type: 'sibnetmp4' }
                                    }]
                                }
                            } else {
                                return {
                                    id,
                                    name: cheerio.load(el).text(),
                                    urls: [{
                                        url,
                                        hls: true,
                                        extractor: { type: 'anidub' }
                                    }]
                                }
                            }
                        })
                }
            }
        })
    }
}

module.exports = AnidubProvider