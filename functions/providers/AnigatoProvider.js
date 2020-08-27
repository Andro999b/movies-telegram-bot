const DataLifeProvider = require('./DataLifeProvider')
const urlencode = require('urlencode')
const superagent = require('superagent')
const $ = require('cheerio')

class AnigatoProvider extends DataLifeProvider {
    constructor() {
        super('anigato', {
            scope: '.sres-wrap',
            selectors: {
                id: {
                    transform: ($el) => urlencode($el.attr('href'))
                },
                name: '.sres-wrap h2',
                image: {
                    selector: '.sres-img img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '.short-top-left h1',
                image: {
                    selector: '.mimg img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: '#kodik-player iframe',
                    transform: async ($el) => {
                        const iframeSrc = $el.attr('src')
                        const res = await superagent
                            .get(iframeSrc.startsWith('//') ? 'https:' + iframeSrc : iframeSrc)
                            .timeout(this.config.timeout)

                        const $iframe = $(res.text)
                        const $seasons = $iframe.find('.series-options')
                            .children()
                            .toArray()

                        if ($seasons.length == 0) {
                            return [{
                                id: 0,
                                urls: [{
                                    url: iframeSrc,
                                    extractor: { type: 'anigit' }
                                }]
                            }]
                        } else {
                            return $seasons
                                .map((el, season) => {
                                    return $(el)
                                        .find('option')
                                        .toArray()
                                        .map((el, episode) => ({
                                            name: `Episode ${episode + 1}`,
                                            path: `Season ${season + 1}`,
                                            urls: [{
                                                url: $(el).attr('value').split('?')[0],
                                                extractor: { type: 'anigit' }
                                            }]
                                        }))
                                })
                                .reduce((acc, items) => acc.concat(items), [])
                                .map((items, id) => ({ id, ...items }))
                        }
                    }
                }
            }
        })
    }
}

module.exports = AnigatoProvider