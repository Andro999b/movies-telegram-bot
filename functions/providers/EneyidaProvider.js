const Provider = require('./CFDataLifeProvider')
const tortugawtfembed = require('../utils/tortugawtfembed')
const urlencode = require('urlencode')

class EneyidaProvider extends Provider {
    constructor() {
        super('eneyida', {
            scope: 'article.related_item',
            selectors: {
                id: {
                    selector: 'a.short_title',
                    transform: ($el) => urlencode($el.attr('href'))
                },
                name: {
                    transform: ($el) => {
                        const name = $el.find('a.short_title').text()
                        const year = $el.find('div.short_subtitle a').text()
                        
                        if(year)
                            return `${name} (${year})`
                        else
                            return name
                    }
                },
                image: {
                    selector: 'a.short_img img',
                    transform: ($el) => this._absoluteUrl($el.attr('data-src'))
                }
            },
            detailsScope: 'article.full',
            detailsSelectors: {
                title: '#full_header-title h1',
                image: {
                    selector: '.full_content-poster.img_box img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: '.video_box iframe',
                    transform: async ($el) => {
                        const files = await tortugawtfembed($el.attr('src'))
                        files.forEach((file, index) => file.id = index)
                        return files
                    }
                },
                trailer: {
                    selector: '#trailer_place iframe',
                    transform: ($el) => $el.attr('src')
                }
            }
        })
    }
}

module.exports = EneyidaProvider