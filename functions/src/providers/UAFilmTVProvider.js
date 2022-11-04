import Provider from './CFDataLifeProvider'
import playerjsembed from '../utils/playerjsembed'
import urlencode from 'urlencode'

class UAFilmTVProvider extends Provider {
    constructor() {
        super('uafilmtv', {
            scope: '.movie-item',
            selectors: {
                id: {
                    selector: 'a.movie-title',
                    transform: ($el) => urlencode($el.attr('href'))
                },
                name:'a.movie-title',
                image: {
                    selector: '.movie-img img',
                    transform: ($el) => this._absoluteUrl($el.attr('data-src'))
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: 'h1[itemprop="name"]',
                image: {
                    selector: '.m-img img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: '.player-box iframe',
                    transform: async ($el) => {
                        const files = await playerjsembed($el.attr('src'))
                        files.forEach((file, index) => file.id = index)
                        return files
                    }
                },
                // trailer: {
                //     selector: '#trailer_place iframe',
                //     transform: ($el) => $el.attr('src')
                // }
            }
        })
    }
}

export default UAFilmTVProvider