import crawler, { RequestGenerator, Selector } from '../utils/crawler'
import cleanupQuery from '../utils/cleanupQuery'
import providersConfig from '../providersConfig'
import urlencode from 'urlencode'
import { File, Playlist, ProviderConfig, SearchResult } from '../types'

interface InfoSelectors {
  title: Selector<string>
  image: Selector<string>
  files: Selector<File[]>
  trailer?: Selector<string | undefined>
}

interface SearchSelector {
  id: Selector<string>
  name: Selector<string>
  image: Selector<string>
}


abstract class Provider<Config extends ProviderConfig> {
  protected readonly config: Config
  protected readonly name: string

  protected abstract infoScope: string
  protected abstract infoSelectors: InfoSelectors

  protected abstract searchScope: string
  protected abstract searchSelector: SearchSelector

  constructor(name: string, config: Config) {
    this.name = name
    this.config = {
      ...config,
      timeout: (config?.timeout ?? providersConfig?.timeout ?? 10) * 1000,
      infoTimeout: (config?.infoTimeout ?? providersConfig?.infoTimeout ?? 10) * 1000,
      headers: {
        'User-Agent': config?.userAgent ?? providersConfig.userAgent,
        ...config.headers
      }
    }
  }

  async search(query: string): Promise<SearchResult[]> {
    const name = this.getName()
    const {
      headers,
      timeout,
      cfbypass
    } = this.config

    query = this._prepareQuery(query)

    let results = await crawler
      .get<Pick<SearchResult, keyof SearchSelector>>(
        this.getSearchUrl(query),
        this.crawlerSearchRequestGenerator(query)
      )
      .cfbypass(cfbypass ?? false)
      .headers(headers!)
      .scope(this.searchScope)
      .timeout(timeout!)
      .set(this.searchSelector)
      .gather() as SearchResult[]

    results = await this.postProcessResult(results)

    return results
      .filter((item) => item.id)
      .map((item) => {
        item.provider = name
        return item
      })
  }

  async getInfo(id: string): Promise<Playlist | null> {
    const {
      headers,
      infoTimeout,
      cfbypass
    } = this.config

    const playlists = await crawler
      .get<Pick<Playlist, keyof InfoSelectors>>(
        this.getInfoUrl(id),
        this.crawlerInfoRequestGenerator(id)
      )
      .cfbypass(cfbypass ?? false)
      .timeout(infoTimeout!)
      .headers(headers!)
      .scope(this.infoScope)
      .set(this.infoSelectors)
      .gather() as Playlist[]

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

  _prepareQuery(query: string): string {
    return cleanupQuery(query)
  }

  // eslint-disable-next-line no-unused-vars
  abstract getSearchUrl(query: string): string

  getName(): string {
    const { subtype } = this.config
    return `${this.name}${subtype ? '-' + subtype : ''}`
  }

  postProcessResult(results: SearchResult[]): Promise<SearchResult[]> {
    results.forEach((result) => {
      result.infoUrl = this.getInfoUrl(result.id)
    })
    return Promise.resolve(results)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  postProcessResultDetails(playlist: Playlist, id: string): Promise<Playlist> {
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

    return this.config.baseUrl + url
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSource(resultsId: string, sourceId: string, params: Record<string, string>): Promise<File | null> {
    return Promise.resolve(null)
  }

  _absoluteUrl(url: string): string {
    const baseUrl = this.config.imagesUrl || this.config.baseUrl
    return url.startsWith('/') ? baseUrl + url : url
  }
}

export default Provider
