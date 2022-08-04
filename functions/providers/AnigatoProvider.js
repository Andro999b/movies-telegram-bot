const DataLifeProvider = require('./DataLifeProvider')
const urlencode = require('urlencode')
const superagent = require('superagent')
const cheerio = require('cheerio')

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
                            .replace('kodik.info', 'kodik.biz')
                            .replace('kodik.cc', 'kodik.biz')
                            .replace('aniqit.com', 'kodik.biz')

                        const res = await superagent
                            .get(iframeSrc.startsWith('//') ? 'https:' + iframeSrc : iframeSrc)
                            .set({ ...this.config.headers })
                            .timeout(this.config.timeout)

                        const $iframe = cheerio.load(res.text)
                        const $seasons = $iframe('.series-options')
                            .first()
                            .children()
                            .toArray()

                        const getOptionUrls = (el) => {
                            const $el = cheerio.load(el).root()
                            return [{
                                url: iframeSrc,
                                extractor: { type: 'anigit', params: { hash: $el.attr('data-hash'), id: $el.attr('data-id') } }
                            }]
                        }

                        if ($seasons.length == 0) {
                            return [{
                                id: 0,
                                urls: [{
                                    url: iframeSrc,
                                    extractor: { type: 'anigit' }
                                }]
                            }]
                        } else if ($seasons.length == 1) {
                            const $season = cheerio.load($seasons[0]).root()
                            return $season.find('option')
                                .toArray()
                                .map((el, id) => ({
                                    id,
                                    name: cheerio.text(el),
                                    urls: getOptionUrls(el)
                                }))
                        } else {
                            return $seasons
                                .map((el, season) => {
                                    return cheerio.load(el)
                                        .root()
                                        .find('option')
                                        .toArray()
                                        .map((el) => ({
                                            name: cheerio.load(el).text(),
                                            path: `Season ${season + 1}`,
                                            urls: getOptionUrls(el)
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

    async getKodikPlayer(worldartAnimationID) {
        const { token, infoTimeout } = this.config

        const res = await superagent
            .get(`https://kodikapi.com/get-player?hasPlayer=false&token=${token}&worldartAnimationID=${worldartAnimationID}`)
            .timeout(infoTimeout)

        return res.body.link
    }
}

module.exports = AnigatoProvider