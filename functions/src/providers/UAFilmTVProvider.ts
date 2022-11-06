import Provider from './CFDataLifeProvider.js'
import playerjsembed from '../utils/playerjsembed.js'
import providersConfig from '../providersConfig.js'
import urlencode from 'urlencode'
import { AnyNode, Cheerio } from 'cheerio'
import { File } from '../types/index.js'

class UAFilmTVProvider extends Provider {
  protected searchScope = '.movie-item'
  protected searchSelector = {
    id: {
      selector: 'a.movie-title',
      transform: ($el: Cheerio<AnyNode>): string => urlencode($el.attr('href') ?? '')
    },
    name: 'a.movie-title',
    image: {
      selector: '.movie-img img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('data-src') ?? '')
    }
  }
  protected infoSelectors = {
    title: 'h1[itemprop="name"]',
    image: {
      selector: '.m-img img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteUrl($el.attr('src') ?? '')
    },
    files: {
      selector: '.player-box iframe',
      transform: async ($el: Cheerio<AnyNode>): Promise<File[]> => {
        const src = $el.attr('src')
        if (!src) return []
        const files = await playerjsembed(src)
        files.forEach((file, index) => file.id = index)
        return files
      }
    },
  }

  constructor() {
    super('uafilmtv', providersConfig.providers.uafilmtv)
  }
}

export default UAFilmTVProvider