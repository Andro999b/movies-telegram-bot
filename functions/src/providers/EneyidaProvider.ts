import Provider from './CFDataLifeProvider.js'
import playerjsembeded from '../utils/playerjsembed.js'
import providersConfig from '../providersConfig.js'
import urlencode from 'urlencode'
import { AnyNode, Cheerio } from 'cheerio'
import { File } from '../types/index.js'

class EneyidaProvider extends Provider {

  constructor() {
    super('eneyida', providersConfig.providers.eneyida)
  }

  protected searchScope = 'article.related_item'
  protected searchSelector = {
    id: {
      selector: 'a.short_title',
      transform: ($el: Cheerio<AnyNode>): string => urlencode($el.attr('href') ?? '')
    },
    name: {
      transform: ($el: Cheerio<AnyNode>): string => {
        const name = $el.find('a.short_title').text()
        const year = $el.find('div.short_subtitle a').text()

        if (year)
          return `${name} (${year})`
        else
          return name
      }
    },
    image: {
      selector: 'a.short_img img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('data-src') ?? '')
    }
  }

  protected override infoScope = 'article.full'
  protected infoSelectors = {
    title: '#full_header-title h1',
    image: {
      selector: '.full_content-poster.img_box img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
    },
    files: {
      selector: '.video_box iframe',
      transform: async ($el: Cheerio<AnyNode>): Promise<File[]> => {
        const src = $el.attr('src')
        if (!src) return []
        const files = await playerjsembeded(src)
        files.forEach((file, index) => file.id = index)
        return files
      }
    },
    trailer: {
      selector: '#trailer_place iframe',
      transform: ($el: Cheerio<AnyNode>): string | undefined => $el.attr('src')
    }
  }
}

export default EneyidaProvider