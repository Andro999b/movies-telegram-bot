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
                    transform: async (_, $root) => {
                        const parts = $root.html().match(/(https:\/\/api[0-9]+[a-z\-\.]+\/embed\/movie\/[0-9]+)/g)
                        
                        if(parts && parts.length > 1) {
                            const files = await deliverembed(parts[1], this.config.baseUrl)

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
}

module.exports = SevenSerailsProvider