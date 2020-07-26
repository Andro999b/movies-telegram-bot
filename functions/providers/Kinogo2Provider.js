const DataLifeProvider = require('./DataLifeProvider')
const deliverembed = require('../utils/deliverembed')
const urlencode = require('urlencode')

class Kinogo2Provider extends DataLifeProvider {
    constructor() {
        super('kinogo2', {
            scope: 'div.shortstory',
            selectors: {
                id: {
                    selector: '.hikinogo_zagolovki a',
                    transform: ($el) => urlencode($el.attr('href'))
                },
                name: '.hikinogo_zagolovki a',
                image: {
                    selector: '.shortimg .poster > img',
                    transform: ($el) => this._absoluteUrl($el.attr('data-src'))
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: {
                    selector: 'meta[itemprop="name"]',
                    transform: ($el) => $el.attr('content')
                },
                image: {
                    selector: '.poster>img',
                    transform: ($el) => this._absoluteUrl($el.attr('data-src'))
                },
                files: {
                    transform: async (_, $root) => {
                        const parts = $root.html().match(/(https:\/\/api[0-9]+[a-z\-.]+\/embed\/movie\/[0-9]+)/g)
                        
                        if(parts && parts.length > 0) {
                            const files = await deliverembed(parts[0], this.config.baseUrl)

                            return files.map((file) => {
                                // const manifestUrl = `https://corsproxy.movies-player.workers.dev?${file.manifestUrl}`
                                return { ...file, manifestUrl: file.manifestUrl }
                            })
                        }

                        return []
                    }
                }
            }
        })
    }
}

module.exports = Kinogo2Provider