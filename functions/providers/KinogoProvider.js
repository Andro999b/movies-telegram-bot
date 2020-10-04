const DataLifeProvider = require('./DataLifeProvider')
const parsePlayerJSFile = require('../utils/parsePlayerJSFile')
const convertPlayerJSPlaylist = require('../utils/convertPlayerJSPlaylist')
const stripPlayerJSConfig = require('../utils/stripPlayerJSConfig')
const urlencode = require('urlencode')
const { extractString } = require('../utils/extractScriptVariable')

class KinogoProvider extends DataLifeProvider {
    constructor() {
        super('kinogo', {
            scope: 'div.shortstory',
            selectors: {
                id: {
                    selector: '.zagolovki>a:nth-last-child(1)',
                    transform: ($el) => urlencode($el.attr('href'))
                },
                name: '.zagolovki>a:nth-last-child(1)',
                image: {
                    selector: '.shortimg>div>a>img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '.shortstorytitle>h1',
                image: {
                    selector: '.fullimg>div>a>img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: '#1212',
                    transform: ($el) => {
                        const script = $el.nextAll(':not([src])').toArray()[0].children[0].data

                        var files = this._tryExtractMp4(script)

                        if (!files) {
                            files = this._tryExtractHls(script)
                        }

                        if (!files) {
                            files = this._tryExtractFiles(script)
                        }

                        files = files || []

                        return files.map((item, index) => ({
                            id: index,
                            ...item
                        }))
                    }
                },
                trailer: {
                    selector: 'video>source',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            }
        })
    }

    _tryExtractHls(script) {
        const fhls = extractString(script, 'fhls')

        if (fhls) {
            const manifestUrl = this._extractManifest(fhls)

            return [{
                manifestUrl
            }]
        }
    }

    _tryExtractMp4(script) {
        const fmp4 = extractString(script, 'fmp4')

        if (fmp4) {
            const urls = parsePlayerJSFile(fmp4)
            
            const url = urls[0].url

            if (url.endsWith('m3u8')) { // not actual mp4 lol
                return [{
                    manifestUrl: url
                }]
            } else {
                return [{ urls }]
            }
        }
    }

    _tryExtractFiles(script) {
        const config = stripPlayerJSConfig(script)

        if (config) {
            const { file } = config
            return convertPlayerJSPlaylist(file)
        }
    }

    _getSiteEncoding() {
        return 'windows-1251'
    }
}

module.exports = KinogoProvider