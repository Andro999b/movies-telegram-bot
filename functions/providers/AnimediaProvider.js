const Provider = require("./Provider")
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
                    selector: '#btn_fav1',
                    transform: async ($el) => {
                        const url = this._absoluteUrl($el.attr('href'))

                        let res = await superagent
                            .get(url)
                            .timeout(this.config.timeout)

                        const $page = $(res.text, { xmlMode: false })

                        const script = $page.find('#playlist_container').next('script')
                            .toArray()[0]
                            .children[0]
                            .data

                        const { file } = stripPlayerJSConfig(script)

                        res = await superagent
                            .get(this._absoluteUrl(file))
                            .timeout(this.config.timeout)

                        console.log(JSON.parse(res.text));

                        return convertPlayerJSPlaylist(JSON.parse(res.text))
                            .map((file, id) => ({ id,...file }))
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