const Provider = require('./Provider')
const superagent = require('superagent')
const $ = require('cheerio')
const urlencode = require('urlencode')
const stripPlayerJSConfig = require('../utils/stripPlayerJSConfig')
const convertPlayerJSPlaylist = require('../utils/convertPlayerJSPlaylist')

class AnimediaProvider extends Provider {
    constructor() {
        super('animedia', {
            detailsScope: '.content-container',
            detailsSelectors: {
                title: '.breadcrumbs__list .breadcrumbs__list__item:last-child',
                image: {
                    selector: '.widget__post-info__poster .zoomLink',
                    transform: ($el) => this._absoluteUrl($el.attr('href'))
                },
                files: {
                    selector: '.media__tabs',
                    transform: async ($el) => {
                        const { baseUrl, timeout } = this.config 
                        const dataId = $el.find('>ul').attr('data-entry_id')
                        const seasons = $el.find('>ul>li>a').toArray().map((el) => $(el).text())

                        console.log(seasons)

                        const playlistsLoaders = seasons.map((_, i) => 
                            superagent
                                .get(`${baseUrl}/embeds/playlist-j.txt/${dataId}/${i + 1}`)
                                .timeout(timeout)
                                .then(it => it.text)
                        )
                        const playlists = await Promise.all(playlistsLoaders)

                        if(playlists.length == 1) {
                            return convertPlayerJSPlaylist(JSON.parse(playlists[0]))
                                .map((file, id) => ({ id, ...file }))
                        } else {
                            let id = 0
                            return playlists.reduce((files, playlist, i) => {
                                const playlistFiles = convertPlayerJSPlaylist(JSON.parse(playlist))
                                    .map((file) => ({ id: ++id, ...file, name: `${seasons[i]}/${file.name}` }))
                                return [...files, ...playlistFiles]
                            }, [])
                        }
                    }
                }
            }
        })
    }

    async search(query) {
        const { searchUrl, timeout } = this.config

        query = this._prepareQuery(query)

        const res = await superagent
            .get(`${searchUrl}?keywords=${encodeURIComponent(query)}&limit=12&orderby_sort=entry_date|desc`)
            .timeout(timeout)

        const $results = $(res.text)

        return $results
            .find('.ads-list__item')
            .toArray() 
            .map((el) => {
                const $el = $(el)
                const $title = $el.find('.ads-list__item__title')
                const $image = $el.find('.ads-list__item__thumb > a > img')

                let src = $image.attr('data-src')
                const index = src.indexOf('?')
                src = src.substr(0, index)
                
                return {
                    provider: this.name,
                    id: urlencode($title.attr('href')),
                    name: $title.text(),
                    image: src
                }
            })
    }
}

module.exports = AnimediaProvider