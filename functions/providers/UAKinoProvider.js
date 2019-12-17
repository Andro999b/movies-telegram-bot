const DataLifeProvider = require('./DataLifeProvider')
const urlencode = require('urlencode')
const superagent = require('superagent')
const cheerio = require('cheerio')
// const getBestPlayerJSQuality = require('../utils/getBestPlayerJSQuality')
// const convertPlayerJSPlaylist = require('../utils/convertPlayerJSPlaylist')

class EXFSProvider extends DataLifeProvider {
    constructor() {
        super('uakino', {
            scope: '.movie-item',
            selectors: {
                id: { 
                    selector: 'a.movie-title', 
                    transform: ($el) => urlencode($el.attr('href')) 
                },
                name: {
                    transform: ($el) => {
                        const season = $el.find('.full-season').text()
                        const title = $el.find('.movie-title').text()

                        return `${title} ${season}`.trim()
                    }
                },
                image: {
                    selector: '.movie-img img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '.solototle',
                image: {
                    selector: '.film-poster img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: '#pre',
                    transform: async ($el) => { 
                        let files = []

                        if($el.has('data-news_id')) {
                            const newsId = $el.attr('data-news_id')
                            const res = await superagent
                                .get(`${this.config.baseUrl}/engine/ajax/playlists.php?news_id=${newsId}&xfield=playlist`)

                            const $ = cheerio.load(JSON.parse(res.text).response)

                            const translations = $('.playlists-lists li')
                                .toArray()
                                .reduce((acc, node) => {
                                    const $node = $(node)
                                    acc[$node.attr('data_id')] = $node.text()
                                    return acc
                                }, {})

                            files = $('.playlists-videos li')
                                .toArray()
                                .map((node) => {
                                    const $node = $(node)
                                    const file = this._getFile($node.attr('data-file'))
                                    const name = $node.text()
                                    const translationId = $node.attr('data_id')

                                    if(file) {
                                        file.name = name

                                        if(translationId) {
                                            const translationName = translations[translationId]
                                            file.path = [translationName, file.path].filter((it) => it).join('/')
                                        }

                                        return file
                                    }
                                })
                                .filter((it) => it)
                        } else {
                            const src = $el.attr('src') 
                            files = [
                                this._getFile(src)
                            ]
                        }

                        return files.map((item, id) => ({
                            ...item,
                            id
                        }))
                    }
                }
            }
        })
    }

    _getFile(url) {
        if(url.indexOf('tortuga') != -1) {
            return {
                manifestUrl: url,
                extractor: { type: 'tortuga' }
            }
        } else if(url.indexOf('ashdi') != -1) {
            return {
                manifestUrl: url,
                extractor: { type: 'ashdi' }
            }
        } else if(url.indexOf('sst.online') != -1) {
            return {
                url: url,
                extractor: { type: 'sstonline' }
            }
        }
    }

    async _postProcessResultDetails(details) {
        details.files = details.files || []

        if(details.files.length == 1) {
            details.files[0].name = details.title
        } 

        return details
    }
}

module.exports = EXFSProvider