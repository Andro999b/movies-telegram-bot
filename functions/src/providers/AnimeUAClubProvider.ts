import Provider from './DataLifeProvider'
import playerjsembed from '../utils/iframes/playerjsembed'
import providersConfig from '../providersConfig'
import { AnyNode, Cheerio } from 'cheerio'
import { File } from '../types/index'
import { lastPathPartNoExt } from '../utils/url'

class AnimeUAClubProvider extends Provider {
  protected searchScope = '.poster'
  protected searchSelector = {
    id: {
      transform: ($el: Cheerio<AnyNode>): string => lastPathPartNoExt($el.attr('href'))
    },
    name: '.poster__title',
    image: {
      selector: '.poster__img img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteImageUrl($el.attr('data-src') ?? '')
    }
  }
  protected infoSelectors = {
    title: 'header.page__subcol-main > h1',
    image: {
      selector: '.pmovie__poster img',
      transform: ($el: Cheerio<AnyNode>): string => this.absoluteImageUrl($el.attr('data-src') ?? '')
    },
    files: {
      selector: '.video-inside iframe',
      transform: async ($el: Cheerio<AnyNode>): Promise<File[]> => {
        const src = $el.eq(0).attr('data-src')
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
    super('animeuaclub', providersConfig.providers.animeuaclub)
  }

  override getInfoUrl(id: string): string {
    if (id.startsWith('http')) {
      return super.getInfoUrl(id)
    }

    const { baseUrl } = this.config
    return `${baseUrl}/${id}.html`
  }
}

export default AnimeUAClubProvider