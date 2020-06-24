const Provider = require('./Provider')
const urlencode = require('urlencode')
const superagent = require('superagent')
const $ = require('cheerio')

class AnimeGOProvider extends Provider {
    constructor() {
        super('animego', {
            scope: '.animes-grid-item',
            selectors: {
                id: { 
                    selector: '.card-title > a', 
                    transform: ($el) => urlencode($el.attr('href')) 
                },
                name: '.card-title > a',
                image: {
                    selector: '.anime-grid-lazy',
                    transform: ($el) => this._absoluteUrl($el.attr('data-original'))
                }
            },
            detailsScope: '#wrap',
            detailsSelectors: {
                title: '.anime-title h1',
                image: {
                    selector: '.anime-poster > div > img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: '#video-player',
                    transform: async ($el) => {
                        // const playerUrl = $el.attr('data-ajax-url')

                        // const res = await superagent
                        //     .get(`${this.config.baseUrl}${playerUrl}`)
                        //     .set('x-requested-with', 'XMLHttpRequest')

                        // const { content } = JSON.parse(res.text)
                        // const $content = $(content)

                        // console.log(content);
                        
                        return []
                    }
                }
            }
        })
    }

    getSearchUrl(query) {
        return `${this.config.searchUrl}?q=${encodeURIComponent(query)}`
    }
}

module.exports = AnimeGOProvider