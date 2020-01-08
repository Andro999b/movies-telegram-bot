const DataLifeProvider = require('./DataLifeProvider')
const urlencode = require('urlencode')
const superagent = require('superagent')
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
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '.ftitle h1',
                image: {
                    selector: '.fposter img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: 'iframe',
                    transform: async ($el) => {
                        const res = await superagent.get($el.attr('src'))
                        
                        const { groups: { file } } = res.text.match(/file:['"](?<file>.+)['"]/)

                        if(file.endsWith('m3u8')) {
                            return [{
                                id: 0,
                                manifestUrl: file,
                            }]
                        }

                        return convertPlayerJSPlaylist(JSON.parse(file))
                            .map((file, id) => ({...file, id}))
                    } 
                }
            }
        })
    }

    async _postProcessResultDetails(details) {
        details.files = details.files || []

        if(details.files.length == 1) {
            details.files[0].name = details.title
        } 

        return details
    }
}

module.exports = EXFSProvider