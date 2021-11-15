const Provider = require('./Provider')
const $ = require('cheerio')
const urlencode = require('urlencode')

class RezkaProvider extends Provider {
    constructor() {
        super('rezka', {
            scope: '.b-content__inline_item',
            selectors: {
                id: { transform: ($el) => urlencode($el.attr('data-url')) },
                name: '.b-content__inline_item-link',
                image: {
                    selector: '.b-content__inline_item-cover > a > img',
                    transform: ($el) => this._absoluteUrl($el.attr('src')),
                },
            },
            detailsScope: '.b-post',
            detailsSelectors: {
                title: '.b-post__title h1',
                image: {
                    selector: '.b-sidecover > a >  img',
                    transform: ($el) => this._absoluteUrl($el.attr('src')),
                },
                files: {
                    transform: async ($scope, $root) => {
                        const configScript = this._extractPlayerConfigScript($root)

                        if (configScript == null) return []

                        let files = this._tryExtractTVShowSchedule($scope, configScript)

                        if(files.length == 0)
                            files = this._tryExtractTVShowFiles($scope, configScript)

                        if (files.length > 0) {
                            return [].concat(...files).map((item, index) => ({
                                id: index,
                                ...item,
                            }))
                        } else {
                            return this._getMovieFile(configScript)
                        }
                    },
                },
                trailer: {
                    selector: '#videoplayer>iframe',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            }
        })
    }

    _tryExtractTVShowSchedule($scope, playerScript) {
        const matches = playerScript.match(/initCDNSeriesEvents\((\d+), (\d+)/)
        if(matches == null) return []

        const dataId = matches[1]
        let translatorId = matches[2]

        const translations = $scope.find('#translators-list')
            .first()
            .children()
            .toArray()
            .reduce((acc, el) => {
                const $el = $(el)
                return {
                    ...acc,
                    [$el.attr('data-translator_id')]: $el.text()
                }
            }, {})

        translatorId = Object.keys(translations).length == 0  ? translatorId : translations

        const seasonsEl = $scope.find('.b-post__schedule')
            .first()
            .find('.b-post__schedule_block')
            .toArray()
            .reverse()

        return seasonsEl.flatMap((seasonEl) => {
            const $season = $(seasonEl)

            return $season
                .find('.b-post__schedule_table>tbody>tr')
                .toArray()
                .reverse()
                .map((el) => {
                    const $el = $(el)

                    const text = $el.find('.td-1').first().text()
                    if(!text) return null

                    const released = $el.find('.td-5').first().children('.exists-episode').length > 0
                    if(!released) return null

                    const parts = text.split(' ')
                    const season = `${parts[0]} ${parts[1]}`
                    const episode = `${parts[2]} ${parts[3]}`

                    return {
                        name: episode,
                        path: season,
                        asyncSource: {
                            dataId,
                            season: parseInt(parts[0]),
                            episode: parseInt(parts[2]),
                            translatorId
                        },
                    }
                })
                .filter((it) => it)
        })
    }

    _tryExtractTVShowFiles($scope, playerScript) {
        const matches = playerScript.match(/initCDNSeriesEvents\(\d+, (\d+)/)
        if(matches == null) return []

        const translatorId = matches[1]

        return $scope
            .find('#simple-episodes-tabs .b-simple_episode__item')
            .toArray()
            .map((el) => {
                const $el = $(el)
                const dataId = $el.attr('data-id')
                const season = $el.attr('data-season_id')
                const episode = $el.attr('data-episode_id')
                const file = {
                    asyncSource: {
                        dataId,
                        season,
                        episode,
                        translatorId
                    },
                    name: `Episode ${episode}`
                }

                if(season) {
                    file.path = `Season ${season}`
                }

                return file
            })
    }

    _getMovieFile(playerScript) {
        const matches = playerScript.match(/initCDNMoviesEvents\((\d+), (\d+)/)

        if(matches == null) return []

        const dataId = matches[1]
        const translatorId = matches[2]

        return [
            {
                id: 0,
                asyncSource: {
                    dataId,
                    translatorId
                }
            },
        ]
    }

    _extractPlayerConfigScript($root) {
        const scripts = $root
            .find('body > script')
            .toArray()
            .map((el) => el.children)
            .filter((el) => el && el.length > 0)
            .map((el) => el[0].data)

        return scripts.find((el) =>
            el.startsWith(' $(function () { sof.tv.initCDN')
        )
    }

    getSearchUrl(query) {
        return `${this.config.searchUrl}&q=${encodeURIComponent(query)}`
    }
}

module.exports = RezkaProvider
