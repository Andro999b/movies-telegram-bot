const DataLifeProvider = require('./DataLifeProvider')
const urlencode = require('urlencode')
const superagent = require('superagent')
const cheerio = require('cheerio')
const getBestPlayerJSQuality = require('../utils/getBestPlayerJSQuality')
const convertPlayerJSPlaylist = require('../utils/convertPlayerJSPlaylist')

class EXFSProvider extends DataLifeProvider {
    constructor() {
        super('exfs', {
            scope: '.SeaRchresultPost',
            selectors: {
                id: { selector: '.SeaRchresultPostTitle a', transform: ($el) => urlencode($el.attr('href')) },
                name: '.SeaRchresultPostTitle',
                image: {
                    selector: '.SeaRchresultPostPoster img',
                    transform: ($el) => this.config.baseUrl + $el.attr('src')
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: 'h1.view-caption',
                image: {
                    selector: '.FullstoryFormLeft img',
                    transform: ($el) => this.config.baseUrl + $el.attr('src')
                },
                files: {
                    selector: 'iframe',
                    transform: async ($el) => {
                        const res = await superagent.get($el.attr('src'))
                        const $ = cheerio.load(res.text)

                        const translations = $('.translations > select > option')
                            .toArray()
                            .reduce((acc, el) => {
                                const $el = $(el)

                                return Object.assign(acc, {
                                    [$el.attr('value')]: $el.text().replace(/[\n]/g, '').trim()
                                })
                            }, {})

                        const files = $('#files').attr('value')
                        const playlists = JSON.parse(files)

                        if(Object.keys(translations).length == 0) {
                            const translationId = $('#translation_id').attr('value')
                            return this._extractNoTranslations(playlists[translationId])
                        }

                        return this._extractTranslations(translations, playlists)
                    }
                }
            }
        })
    }

    _extractNoTranslations(playlist) {
        if (typeof playlist === 'string') {
            const urls = getBestPlayerJSQuality(playlist)

            return [{
                url: urls.pop(),
                alternativeUrls: urls
            }]
        } else {
            return convertPlayerJSPlaylist(playlist)
        }
    }

    _extractTranslations(translations, playlists) {
        return Object.keys(translations)
            .map((translation) => {
                const translationName = translation === '0' ? '' : `[${translations[translation]}] `
                const playlist = playlists[translation]

                if (typeof playlist === 'string') {
                    const urls = getBestPlayerJSQuality(playlist)

                    return [{
                        name: translationName,
                        url: urls.pop(),
                        alternativeUrls: urls
                    }]
                } else {
                    return convertPlayerJSPlaylist(playlist)
                        .map((file) => ({
                            ...file,
                            name: `${translationName}${file.name}`,
                            path: `${translationName}${file.path}`
                        }))
                }
            })
            .reduce((acc, item) => acc.concat(item), [])
            .map((file, index) => ({
                ...file,
                id: index
            }))
    }

    _postProcessResult(results) {
        return super._postProcessResult(
            results.filter(({ id }) => id.indexOf('actors') === -1)
        )
    }

    async _postProcessResultDetails(details) {
        if(details.files.length == 1) {
            details.files[0].name = details.title
        } 

        return details
    }
}

module.exports = EXFSProvider