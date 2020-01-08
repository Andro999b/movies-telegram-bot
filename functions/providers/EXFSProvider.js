const DataLifeProvider = require('./DataLifeProvider')
const urlencode = require('urlencode')
const videocdnembed = require('../utils/videocdnembed')

class EXFSProvider extends DataLifeProvider {
    constructor() {
        super('exfs', {
            scope: '.SeaRchresultPost',
            selectors: {
                id: { selector: '.SeaRchresultPostTitle a', transform: ($el) => urlencode($el.attr('href')) },
                name: '.SeaRchresultPostTitle',
                image: {
                    selector: '.SeaRchresultPostPoster img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: 'h1.view-caption',
                image: {
                    selector: '.FullstoryFormLeft img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: 'iframe',
                    transform: ($el) => videocdnembed($el.attr('src'))
                }
            }
        })
    }

    _postProcessResult(results) {
        return super._postProcessResult(
            results.filter(({ id }) => id.indexOf('actors') === -1)
        )
    }

    async _postProcessResultDetails(details) {
        if(details.files.length == 1) {
            details.files[0].name = details.title
        } 

        return details
    }
}

module.exports = EXFSProvider