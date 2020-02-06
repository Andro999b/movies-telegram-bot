const DataLifeProvider = require('./DataLifeProvider')
const urlencode = require('urlencode')
const $ = require('cheerio')
const { URL } = require('url')

const videocdnembed = require('../utils/videocdnembed')
const deliverembed = require('../utils/deliverembed')
const tortugawtfembed = require('../utils/tortugawtfembed')

class Kino4UaProvider extends DataLifeProvider {
    constructor() {
        super('kino4ua', {
            scope: 'a.sres-wrap',
            selectors: {
                id: {
                    transform: ($el) => urlencode($el.attr('href'))
                },
                name: '.sres-text>h2',
                image: {
                    selector: '.sres-img>img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                }
            },
            detailsScope: '#dle-content',
            detailsSelectors: {
                title: '#mc-right>h1',
                image: {
                    selector: '.m-img>img',
                    transform: ($el) => this._absoluteUrl($el.attr('src'))
                },
                files: {
                    selector: 'iframe',
                    transform: ($el) => {
                        const srcs = $el.toArray().map((el) => $(el).attr('src'))

                        let src

                        src = srcs.find((i) => i.indexOf('delivembed') != -1)
                        if(src) {
                            const url = new URL(src)

                            Object.keys(url.searchParams).forEach((p) => {
                                url.searchParams[p] = encodeURIComponent(url.searchParams[p])// escape all cyrillyc shit
                            })

                            return deliverembed(url.toString())
                        }

                        src = srcs.find((i) => i.indexOf('videocdn') != -1)
                        if(src) {
                            return videocdnembed(src)
                        }

                        src = srcs.find((i) => i.indexOf('tortuga') != -1)
                        if(src) {
                            return tortugawtfembed(src)
                        }

                        return []
                    }
                }
            }
        })
    }
}

module.exports = Kino4UaProvider