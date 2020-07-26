const DataLifeProvider = require('./DataLifeProvider')
const urlencode = require('urlencode')
const deliverembed = require('../utils/deliverembed')

class SevenSerailsProvider extends DataLifeProvider {
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
                            .attr('data-src')
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
                        const parts = $root.html().match(/(https:\/\/api[0-9]+[a-z\-.]+\/embed\/movie\/[0-9]+)/g)
                        
                        if(parts && parts.length > 1) {
                            const files = await deliverembed(parts[1])

                            return files.map((file) => {
                                return { ...file, manifestUrl: file.manifestUrl }
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
}

module.exports = SevenSerailsProvider