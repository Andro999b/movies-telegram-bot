const Provider = require('./Provider')
const urlencode = require('urlencode')
const $ = require('cheerio')

class YummyanimeProvider extends Provider {
    constructor() {
        super('yummyanime', {
            scope: '.anime-column',
            selectors: {
                id: { selector: 'a.anime-title', transform: ($el) => urlencode($el.attr('href')) },
                name: 'a.anime-title',
                image: {
                    selector: 'a.image-block img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '.anime-page',
            detailsSelectors: {
                title: 'h1',
                image: {
                    selector: '.poster-block img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: '.video-block',
                    transform: async ($el) => {
                        const playlists = $el
                            .filter((_, item) =>
                                $(item).find('.video-block-description').text().indexOf('Sibnet') != -1
                            )
                            .toArray()
                            .map((item) => {
                                const $item = $(item)
                                const title = $item.find('.video-block-description').text().trim()

                                return {
                                    title,
                                    links: $item
                                        .find('.video-button')
                                        .map((_, btn) =>
                                            $(btn).attr('data-href')
                                        )
                                        .toArray()
                                }
                            })

                        if (playlists.length == 1) {
                            return playlists[0].map(({ links }) =>
                                links.map((link, index) => ({
                                    extractor: { type: 'sibnet' },
                                    url: link,
                                    name: `Episode ${1 + index}`
                                }))
                            )
                        }

                        return playlists
                            .map(({ title, links }) =>
                                links.map((link, index) => ({
                                    extractor: { type: 'sibnet' },
                                    url: link,
                                    name: `${title}/Episode ${1 + index}`,
                                    path: title
                                }))
                            )
                            .reduce((acc, item) => acc.concat(item), [])
                            .map((item, id) => ({ id, ...item }))
                    }
                }
            }
        })
    }

    getInfoUrl(resultId) {
        return this.config.baseUrl + decodeURIComponent(resultId)
    }

    getSearchUrl(q) {
        return `${this.config.searchUrl}?word=${encodeURIComponent(q)}`
    }

    async _postProcessResultDetails(details) {
        details.files = details.files || []

        if (details.files.length == 1) {
            details.files[0].name = details.title
        }

        return details
    }
}

module.exports = YummyanimeProvider