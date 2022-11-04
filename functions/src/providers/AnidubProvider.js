import Provider from './DataLifeProvider'
import $ from 'cheerio'
import urlencode from 'urlencode'

class AnidubProvider extends Provider {
    constructor() {
        super('anidub', {
            scope: '.th-item',
            selectors: {
                id: { selector: '.th-in', transform: ($el) => urlencode($el.attr('href')) },
                name: '.th-in > .th-title',
                image: {
                    selector: '.th-img > img',
                    transform: ($el) => this._absoluteUrl($el.attr('data-src'))
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '.fright.fx-1 h1',
                image: {
                    selector: '.img-box img',
                    transform: ($el) => this._absoluteUrl($el.attr('data-src'))
                },
                files: {
                    selector: '.video-box .series-tab span',
                    transform: ($el) => $el
                        .toArray()
                        .map((el, id) => {
                            const url = $el.attr('data')
                            if (url.indexOf('sibnet') != -1) {
                                return {
                                    id,
                                    name: $(el).text(),
                                    urls: [{
                                        url,
                                        extractor: { type: 'sibnetmp4' }
                                    }]
                                }
                            } else if(url.startsWith('/player')) {
                                return {
                                    id,
                                    name: $(el).text(),
                                    urls: [{
                                        url,
                                        hls: true,
                                        extractor: { type: 'anidub' }
                                    }]
                                }
                            }
                        })
                        .filter((f) => f)
                },
                trailer: {
                    selector: '.video-box .series-tab span',
                    transform: ($el) => {
                        const url = $el.eq(0).attr('data')
                        
                        if(url != null && url.indexOf('youtube.com')) {
                            return url
                        }
                    }
                }
            }
        })
    }
}

export default AnidubProvider