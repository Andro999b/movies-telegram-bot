import Provider from './DataLifeProvider'
import $, { AnyNode, Cheerio } from 'cheerio'
import urlencode from 'urlencode'
import providersConfig from '../providersConfig'
import { File } from '../types/index'

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
      selector: '.video-box .tabs-box',
      transform: ($el: Cheerio<AnyNode>): File[] => {
        const files: File[] = []
        //.series-tab span

        $el.each((_, node) => {
          $(node)
            .find('.series-tab span')
            .each((id, el) => {
              if (!files[id]) {
                files[id] = {
                  id,
                  name: $(el).text(),
                  urls: []
                }
              }

              const url = $(el).attr('data') ?? ''
              if (url.indexOf('sibnet') != -1) {
                files[id].urls?.push({
                  url,
                  extractor: { type: 'sibnetmp4' }
                })
              } else if (url.startsWith('/player')) {
                files[id].urls?.push({
                  url,
                  hls: true,
                  extractor: { type: 'anidub' }
                })
              }
            })
        })

        return files
      }
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