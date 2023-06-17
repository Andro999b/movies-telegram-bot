import Provider from './CFDataLifeProvider'
import playerjsembed from '../utils/iframes/playerjsembed'
import providersConfig from '../providersConfig'
import { AnyNode, Cheerio } from 'cheerio'
import { File } from '../types/index'
import { lastPathPartNoExt } from '../utils/url'

class UAFilmTVProvider extends Provider {
  protected searchScope = '.movie-item'
  protected searchSelector = {
    id: {
      selector: 'a.movie-title',
      transform: ($el: Cheerio<AnyNode>): string => lastPathPartNoExt($el.attr('href'))
    },
    name: 'a.movie-title',
    image: {
      selector: '.movie-img img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteImageUrl($el.attr('data-src') ?? '')
    }
  }
  protected infoSelectors = {
    title: 'h1[itemprop="name"]',
    image: {
      selector: '.m-img img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteImageUrl($el.attr('src') ?? '')
    },
    files: {
      selector: '.player-box iframe',
      transform: async ($el: Cheerio<AnyNode>): Promise<File[]> => {
        const src = $el.attr('src')
        if (!src) {
          throw new Error('No iframe src')
        }
        const files = await playerjsembed(src)
        files.forEach((file, index) => file.id = index)
        return files
      }
    },
  }

  constructor() {
    super('uafilmtv', providersConfig.providers.uafilmtv)
  }

  override getInfoUrl(id: string): string {
    if (id.startsWith('http')) {
      return super.getInfoUrl(id)
    }

    const { baseUrl } = this.config
    return `${baseUrl}/${id}.html`
  }
}

export default UAFilmTVProvider