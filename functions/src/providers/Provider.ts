import providersConfig from '../providersConfig'
import { File, Playlist, ProviderConfig, ProvidersNames, SearchResult } from '../types/index'
import cleanupQuery from '../utils/cleanupQuery'
import debugFactory, { Debugger } from 'debug'

abstract class Provider<Config extends ProviderConfig = ProviderConfig> {
  protected readonly config: Config
  protected readonly name: string
  protected readonly debug: Debugger

  constructor(name: ProvidersNames, config: Config) {
    this.name = name
    this.config = {
      ...config,
      timeout: (config?.timeout ?? providersConfig?.timeout ?? 10) * 1000,
      infoTimeout: (config?.infoTimeout ?? providersConfig?.infoTimeout ?? 10) * 1000,
      userAgent: config?.userAgent ?? providersConfig.userAgent,
      headers: {
        'User-Agent': config?.userAgent ?? providersConfig.userAgent,
        ...config.headers
      }
    }

    this.debug = debugFactory(name)
  }

  abstract search(query: string): Promise<SearchResult[]>
  abstract getInfo(id: string): Promise<Playlist | null>

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSource(resultsId: string, sourceId: string, params?: Record<string, string>): Promise<Partial<File> | null> {
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
