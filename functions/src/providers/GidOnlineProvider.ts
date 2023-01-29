import CrawlerProvider from './CrawlerProvider'
import providersConfig from '../providersConfig'
import { AnyNode, Cheerio } from 'cheerio'
import urlencode from 'urlencode'
import superagent from 'superagent'
import { File } from '../types'

const BLOCK_COUNTIRES_REGEXP = /&block=[a-z,]+/

class GidOnlineProvider extends CrawlerProvider {
    protected searchScope = '.mainlink'
    protected searchSelector = {
        id: {
            transform: ($el: Cheerio<AnyNode>): string => urlencode($el.attr('href') ?? '')
        },
        image: {
            selector: 'img',
            transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
        },
        name: {
            transform: ($el: Cheerio<AnyNode>): string => {
                const name = $el.find('span').text()
                const year = $el.find('.mqn').text()

                return `${name} (${year})`
            }
        }
    }
    protected infoScope = '#main'
    protected infoSelectors = {
        title: '#single > .t-row > .r-1 > .rl-2',
        image: {
            selector: '#single > img.t-img',
            transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
        },
        files: {
            sellector: 'iframe#cdn-player',
            transform: ($el: Cheerio<AnyNode>): File[] => {
                let iframeSrc = $el.attr('src')

                if (!iframeSrc)
                    return []

                iframeSrc = iframeSrc.replace(BLOCK_COUNTIRES_REGEXP, '')

                const res = superagent
                    .get(iframeSrc)
                    .set(this.config.headers!)
                    .timeout(5000)
                    .disableTLSCerts()
                
                console.log(res)

                return []
            }
        }
    }

    constructor() {
        super('gidonline', providersConfig.providers.gidonline)
    }

    getSearchUrl(query: string): string {
        const { searchUrl } = this.config

        return `${searchUrl}?s=${encodeURIComponent(query)}`
    }
}

export default GidOnlineProvider