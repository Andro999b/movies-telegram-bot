import Provider from './DataLifeProvider'
import $, { AnyNode, Cheerio } from 'cheerio'
import urlencode from 'urlencode'
import providersConfig from '../providersConfig'
import { File } from '../types'

class AnidubProvider extends Provider {
  protected searchScope = '.th-item'
  protected searchSelector = {
    id: {
      selector: '.th-in',
      transform: ($el: Cheerio<AnyNode>): string => urlencode($el.attr('href') ?? '')
    },
    name: '.th-in > .th-title',
    image: {
      selector: '.th-img > img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('data-src') ?? '')
    }
  }
  protected infoSelectors = {
    title: '.fright.fx-1 h1',
    image: {
      selector: '.img-box img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('data-src') ?? '')
    },
    files: {
      selector: '.video-box .series-tab span',
      transform: ($el: Cheerio<AnyNode>): File[] => $el
        .toArray()
        .map((el, id) => {
          const url = $el.attr('data') ?? ''
          if (url.indexOf('sibnet') != -1) {
            return {
              id,
              name: $(el).text(),
              urls: [{
                url,
                extractor: { type: 'sibnetmp4' }
              }]
            }
          } else if (url.startsWith('/player')) {
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

          return null
        })
        .filter((f) => f) as File[]
    },
    trailer: {
      selector: '.video-box .series-tab span',
      transform: ($el: Cheerio<AnyNode>): string | undefined => {
        const url = $el.eq(0).attr('data')

        if (url != null && url.indexOf('youtube.com')) {
          return url
        }

        return
      }
    }
  }

  constructor() {
    super('anidub', providersConfig.providers.anidub)
  }
}

export default AnidubProvider