const Provider = require('./Provider')
const urlencode = require('urlencode')
const deliverembed = require('../utils/deliverembed')
const $ = require('cheerio')

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
                    transform: async (_, $root) => {
                        const parts = $root.html().match(/(https:\/\/api[0-9]+\.delivembed\.cc\/embed\/movie\/[0-9]+)/)

                        if(parts && parts.length > 1) {
                            const files = await deliverembed(parts[1])

                            return files.map((file) => {
                                const parts = file.manifestUrl.split('?video=')
                                const manifestUrl = decodeURIComponent(parts[1])
                                return {
                                    ...file,
                                    manifestUrl
                                }
                            })
                        }

                        return []
                    }
                }
            }
        })
    }

    getInfoUrl(resultId) {
        return decodeURIComponent(resultId)
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