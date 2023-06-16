import crawler, { RequestGenerator, Selector } from '../utils/crawler'
import urlencode from 'urlencode'
import { File, Playlist, ProviderConfig, SearchResult } from '../types/index'
import Provider from './Provider'

export interface InfoSelectors {
  title: Selector<string, Playlist, InfoParams>
  image: Selector<string, Playlist, InfoParams>
  files: Selector<File[], Playlist, InfoParams>
  trailer?: Selector<string | undefined, Playlist, InfoParams>
}

export interface SearchSelectors {
  id: Selector<string, SearchResult>
  name: Selector<string, SearchResult>
  image?: Selector<string, SearchResult>
}

export interface InfoParams {
  id: string
}

abstract class CrawlerProvider<Config extends ProviderConfig = ProviderConfig> extends Provider<Config> {
  protected abstract searchScope: string
  protected abstract searchSelector: SearchSelectors

  protected abstract infoScope: string
  protected abstract infoSelectors: InfoSelectors

  override async search(query: string): Promise<SearchResult[]> {
    const name = this.getName()
    const {
      headers,
      timeout,
      bypassMode
    } = this.config

    query = this.prepareQuery(query)

    let results = await crawler
      .get<SearchResult>(
        this.getSearchUrl(query),
        this.crawlerSearchRequestGenerator(query)
      )
      .bypassMode(bypassMode ?? null)
      .headers(headers!)
      .scope(this.searchScope)
      .timeout(timeout!)
      .set(this.searchSelector)
      .gather()

    results = await this.postProcessResult(results)

    return results
      .filter((item) => item.id)
      .map((item) => {
        item.provider = name
        return item
      })
  }

  override async getInfo(id: string): Promise<Playlist | null> {
    const {
      headers,
      infoTimeout,
      bypassMode
    } = this.config

    const playlists = await crawler
      .get<Playlist, InfoParams>(
        this.getInfoUrl(id),
        this.crawlerInfoRequestGenerator(id)
      )
      .bypassMode(bypassMode ?? null)
      .timeout(infoTimeout!)
      .headers(headers!)
      .scope(this.infoScope)
      .set(this.infoSelectors)
      .gather({ id })

    if (playlists.length < 1) return null

    let playlist = playlists[0]
    playlist = await this.postProcessResultDetails(playlist, id)
    playlist = {
      ...playlist,
      provider: this.getName(),
      id
    }

    return playlist
  }

  // eslint-disable-next-line no-unused-vars
  abstract getSearchUrl(query: string): string

  protected postProcessResult(results: SearchResult[]): Promise<SearchResult[]> {
    results.forEach((result) => {
      result.infoUrl = this.getInfoUrl(result.id)
    })
    return Promise.resolve(results)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected postProcessResultDetails(playlist: Playlist, id: string): Promise<Playlist> {
    playlist.files = playlist.files ?? []

    if (playlist.files.length == 1) {
      const file = playlist.files[0]
      if (!file.name) file.name = playlist.title
    }

    return Promise.resolve(playlist)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected crawlerSearchRequestGenerator(query: string, page?: number): RequestGenerator | undefined {
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected crawlerInfoRequestGenerator(resultsId: string): RequestGenerator | undefined {
    return
  }

  getInfoUrl(id: string): string {
    const url = urlencode.decode(id)

    if (url.startsWith('http')) {
      if (url.startsWith(this.config.baseUrl)) {
        return url
      } else {
        return url.replace(/https?:\/\/[a-z0-9.]+/, this.config.baseUrl)
      }
    }

    if(url.startsWith('/') || this.config.baseUrl.endsWith('/')) {
      return this.config.baseUrl + url
    } else {
      return this.config.baseUrl + '/' + url
    }
  }

  protected absoluteImageUrl(url: string): string {
    const baseUrl = this.config.imagesUrl || this.config.baseUrl
    return url.startsWith('/') ? baseUrl + url : url
  }
}

export default CrawlerProvider
