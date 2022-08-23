const Provider = require('./DataLifeProvider')
const urlencode = require('urlencode')
const superagent = require('superagent')
const $ = require('cheerio').default
const cheerio = require('cheerio')

class AnigatoProvider extends Provider {
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

                        const $translations = $iframe('.serial-translations-box, .movie-translations-box').find('option').toArray()

                        if ($seasons.length == 0) {
                            return [{
                                id: 0,
                                urls: $translations.map((t) => {
                                    const $t = $(t)
                                    return {
                                        url: '',
                                        audio: $t.text(),
                                        hls: true,
                                        extractor: {
                                            type: 'anigit',
                                            params: this._getTranslationParams($t)
                                        }
                                    }
                                })
                            }]
                        } else if ($seasons.length == 1) {
                            const $season = $($seasons[0])
                            const seasonNum = this._getSeassonNum($season)
                            return $season
                                .find('option')
                                .toArray()
                                .map((el, id) => {
                                    const $el = $(el)
                                    return {
                                        id,
                                        name: $el.text(),
                                        urls: this.getSeasonEpisodeUrls($el, seasonNum, $translations)
                                    }
                                })
                        } else {
                            return $seasons
                                .map((el) => {
                                    const $season = $(el)
                                    const seasonNum = this._getSeassonNum($season)
                                    return $season
                                        .find('option')
                                        .toArray()
                                        .map((el) => {
                                            const $el = $(el)
                                            return {
                                                name: $el.text(),
                                                path: `Season ${seasonNum}`,
                                                urls: this.getSeasonEpisodeUrls($el, seasonNum, $translations)
                                            }
                                        })
                                })
                                .reduce((acc, items) => acc.concat(items), [])
                                .map((items, id) => ({ id, ...items }))
                        }
                    }
                }
            }
        })
    }

    _getTranslationParams($t) {
        return {
            thash: $t.attr('data-media-hash'),
            tid: $t.attr('data-media-id'),
            ttype: $t.attr('data-media-type'),
        }
    }

    getSeasonEpisodeUrls($el, seasonNum, $translations) {
        return $translations.map((t) => {
            const $t = $(t)

            return {
                url: '' + $el.val(),
                audio: $t.text(),
                hls: true,
                extractor: {
                    type: 'anigit',
                    params: {
                        season: seasonNum,
                        ...this._getTranslationParams($t)
                    }
                }
            }
        })
    }

    _getSeassonNum($season) {
        return $season.attr('class').substring('season-'.length)
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