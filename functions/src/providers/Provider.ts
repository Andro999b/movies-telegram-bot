import providersConfig from '../providersConfig.js'
import { File, Playlist, ProviderConfig, SearchResult } from '../types/index.js'
import cleanupQuery from '../utils/cleanupQuery.js'

abstract class Provider<Config extends ProviderConfig = ProviderConfig> {
  protected readonly config: Config
  protected readonly name: string

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

  abstract search(query: string): Promise<SearchResult[]>
  abstract getInfo(id: string): Promise<Playlist | null>

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSource(resultsId: string, sourceId: string, params?: Record<string, string>): Promise<File | null> {
    return Promise.resolve(null)
  }

  protected prepareQuery(query: string): string {
    return cleanupQuery(query)
  }

  getName(): string {
    return this.name
  }
}

export default Provider
