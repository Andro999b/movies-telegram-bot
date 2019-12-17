const Provider = require('./Provider')
const urlencode = require('urlencode')
const deliverembed = require('../utils/deliverembed')

class SevenSerailsProvider extends Provider {
    constructor() {
        super('7serealov', {
            scope: '.eTitle',
            selectors: {
                id: { selector: 'a', transform: ($el) => urlencode($el.attr('href')) },
                name: 'a',
                image: {
                    transform: ($el) =>
                        this._absoluteUrl($el.nextAll('.bl2')
                            .first()
                            .find('img')
                            .attr('src')
                        )
                }
            },
            detailsScope: 'section',
            detailsSelectors: {
                title: '.eTitle h1',
                image: {
                    selector: '.bl1 img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: 'iframe',
                    transform: async ($el) => {
                        const files = await deliverembed($el.attr('src'))

                        return files.map((file) => ({
                            ...file,
                            cors: true
                        }))
                    }
                }
            }
        })
    }

    getSearchUrl(q) {
        return `${this.config.searchUrl}?q=${encodeURIComponent(q)}`
    }

    async _postProcessResultDetails(details) {
        details.files = details.files || []

        if (details.files.length == 1) {
            details.files[0].name = details.title
        }

        return details
    }
}

module.exports = SevenSerailsProvider