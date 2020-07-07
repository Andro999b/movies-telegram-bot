const DataLifeProvider = require("./DataLifeProvider")
const superagent = require('superagent')
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
                        .map((el,id) => {
                            const $el = $(el)

                            return {
                                id,
                                name: $el.text(),
                                urls: [{
                                    url: $el.attr('data'),
                                    extractor: { type: 'sibnetmp4' }
                                }]
                            }
                        })
                }
            }
        })
    }
}

module.exports = AnidubProvider