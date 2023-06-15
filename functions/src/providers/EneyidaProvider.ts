import Provider from './CFDataLifeProvider'
import playerjsembeded from '../utils/iframes/playerjsembed'
import providersConfig from '../providersConfig'
import { AnyNode, Cheerio } from 'cheerio'
import { File } from '../types/index'
import { lastPathPartNoExt } from '../utils/url'

class EneyidaProvider extends Provider {

  constructor() {
    super('eneyida', providersConfig.providers.eneyida)
  }

  protected searchScope = 'article.related_item'
  protected searchSelector = {
    id: {
      selector: 'a.short_title',
      transform: ($el: Cheerio<AnyNode>): string => lastPathPartNoExt($el.attr('href'))
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
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteImageUrl($el.attr('data-src') ?? '')
    }
  }

  protected override infoScope = 'article.full'
  protected infoSelectors = {
    title: '#full_header-title h1',
    image: {
      selector: '.full_content-poster.img_box img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteImageUrl($el.attr('src') ?? '')
    },
    files: {
      selector: '.video_box iframe',
      transform: async ($el: Cheerio<AnyNode>): Promise<File[]> => {
        const src = $el.attr('src')
        if (!src) return []
        const files = await playerjsembeded(src, true)
        files.forEach((file, index) => file.id = index)
        return files
      }
    },
    trailer: {
      selector: '#trailer_place iframe',
      transform: ($el: Cheerio<AnyNode>): string | undefined => $el.attr('src')
    }
  }

  override getInfoUrl(id: string): string {
    if (id.startsWith('http')) {
      return super.getInfoUrl(id)
    }

    const { baseUrl } = this.config
    return `${baseUrl}/${id}.html`
  }
}

export default EneyidaProvider