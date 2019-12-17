const DataLifeProvider = require('./DataLifeProvider')
const urlencode = require('urlencode')
const deliverembed = require('../utils/deliverembed')

class BaskinoProvider extends DataLifeProvider {
    constructor() {
        super('baskino', {
            scope: '.shortpost',
            selectors: {
                id: { selector: '.posttitle a', transform: ($el) => urlencode($el.attr('href')) },
                name: '.posttitle a',
                image: { selector: '.postcover a img', transform: ($el) => this._absoluteUrl($el.attr('src')) }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '.title_social h1', 
                image: {
                    selector: '.mobile_cover img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: 'iframe',
                    transform: async ($el) => deliverembed($el.attr('src'))
                }
            }
        })
    }

    _getBestQuality(input) {
        return Object.keys(input)
            .map((key) => {
                return {
                    url: input[key],
                    quality: parseInt(key)
                }
            })
            .filter((it) => it)
            .sort((a, b) => a.quality - b.quality)
            .map((it) => it.url)
            .pop()
    }

    async _postProcessResultDetails(details) {
        details.files = details.files || []

        if(details.files.length == 1) {
            details.files[0].name = details.title
        } 

        return details
    }
}

module.exports = BaskinoProvider