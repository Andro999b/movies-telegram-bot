import providersConfig from '../providersConfig'
import { SearchResult } from '../types'
import CrawlerProvider, { InfoSelectors, SearchSelectors } from './CrawlerProvider'
import superagent from 'superagent'

interface APISearchResponse {
  href: string
  rus_name: string
  releaseDate: string
  cover: {
    default: string
  }
}

class AnimelibProvider extends CrawlerProvider {
  protected override searchScope: string
  protected override searchSelector: SearchSelectors
  protected override infoScope: string
  protected override infoSelectors: InfoSelectors

  override async search(query: string): Promise<SearchResult[]> {
    const { timeout } = this.config

    const res = await superagent
      .get(this.getSearchUrl(query))
      .timeout(timeout!)

    const apiSearchResponse = res.body as APISearchResponse[]

    return apiSearchResponse.map((r) => {
      let name = r.rus_name

      if(r.releaseDate) {
        name += r.releaseDate.split('-')[0]
      }

      return {
        name,
        id: r.href,
        image: r.cover.default,
        provider: this.name,
        infoUrl: this.getInfoUrl(r.href)
      }
    })
  }

  override getSearchUrl(query: string): string {
    const { searchUrl } = this.config

    return `${searchUrl}?type=anime&q=${encodeURIComponent(query)}`
  }

  constructor() {
    super('animelib', providersConfig.providers.animelib)
  }
}

export default AnimelibProvider