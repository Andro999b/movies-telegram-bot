const DataLifeProvider = require('./DataLifeProvider')
const getBestPlayerJSQuality= require('../utils/getBestPlayerJSQuality')
const convertPlayerJSPlaylist= require('../utils/convertPlayerJSPlaylist')
const { tableLikeExtractor } = require('../utils/detailsExtractors')

class KinogoProvider extends DataLifeProvider {
    constructor() {
        super('kinogo', {
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '.shortstorytitle>h1',
                image: {
                    selector: '.fullimg>div>a>img',
                    transform: ($el) => this.config.baseUrl + $el.attr('src')
                },
                description: {
                    selector: '.quote',
                    transform: tableLikeExtractor
                },
                files: {
                    selector: '#1212',
                    transform: ($el) => {
                        const script = $el.next().toArray()[0].children[0].data

                        var files = this._tryExtractMp4(script)

                        if(!files) {
                            files = this._tryExtractHls(script)
                        }

                        if(!files) {
                            files = this._tryExtractFiles(script)
                        }

                        files = files || []

                        return files.map((item, index) => ({
                            id: index,
                            ...item
                        }))
                    }
                }
            }
        })
    }

    _tryExtractHls(script) {
        const parts = script.match(/fhls = "([^"]+)"/)

        if(parts && parts.length > 1) {
            const manifestUrl = this._extractManifest(parts[1])

            return [{ 
                manifestUrl
            }]
        }
    }

    _tryExtractMp4(script) {
        const parts = script.match(/fmp4 = "([^"]+)"/)

        if(parts && parts.length > 1) {
            const urls = getBestPlayerJSQuality(parts[1])

            return [{ 
                url: urls.pop(), 
                alternativeUrls: urls 
            }]
        }
    }

    _tryExtractFiles(script) {
        const parts = script.match(/new Playerjs\((.+)\)/)

        if(parts) {
            let config

            eval(`config = ${parts[1]}`)
            
            const { file } = config
            if(typeof file === 'string') {
                const urls = getBestPlayerJSQuality(file)

                return [{ 
                    url: urls.pop(), 
                    alternativeUrls: urls 
                }]
            } else {
                return convertPlayerJSPlaylist(file)
            }
        }
    }

    async _postProcessResultDetails(details) {
        if(details.files.length == 1) {
            details.files[0].name = details.title
        } 

        return details
    }

    _getSiteEncoding() {
        return 'windows-1251'
    }
}

module.exports = KinogoProvider