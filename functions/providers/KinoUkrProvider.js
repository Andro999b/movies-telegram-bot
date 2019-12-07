const DataLifeProvider = require('./DataLIfeProvider')
const urlencode = require('urlencode')
const superagent = require('superagent')
// const cheerio = require('cheerio')
// const getBestPlayerJSQuality = require('../utils/getBestPlayerJSQuality')
const convertPlayerJSPlaylist = require('../utils/convertPlayerJSPlaylist')

class EXFSProvider extends DataLifeProvider {
    constructor() {
        super('kinoukr', {
            scope: '.short',
            selectors: {
                id: { 
                    selector: 'a.short-title', 
                    transform: ($el) => urlencode($el.attr('href')) 
                },
                name: 'a.short-title',
                image: {
                    selector: '.short-img img',
                    transform: ($el) => this.config.baseUrl + $el.attr('src')
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '.ftitle h1',
                image: {
                    selector: '.fposter img',
                    transform: ($el) => this.config.baseUrl + $el.attr('src')
                },
                files: {
                    selector: 'iframe',
                    transform: async ($el) => {
                        const res = await superagent.get($el.attr('src'))
                        const { groups: { file } } = res.text.match(/file:'(?<file>.+)'/)

                        return convertPlayerJSPlaylist(JSON.parse(file))
                            .map((file, id) => ({...file, id}))
                    } 
                }
            }
        })
    }
}

module.exports = EXFSProvider