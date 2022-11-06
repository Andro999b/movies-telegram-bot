import Provider from './Provider'
import urlencode from 'urlencode'
import invokeCFBypass from '../utils/invokeCFBypass'
import { ProviderConfig } from '../types'
import { RequestGenerator } from '../utils/crawler'

abstract class DataLifeProvider<Config extends ProviderConfig = ProviderConfig> extends Provider<Config> {
  override getSearchUrl(): string {
    return ''
  }

  protected getSiteEncoding(): string {
    return 'utf8'
  }

  override crawlerSearchRequestGenerator(query: string): RequestGenerator {
    const { searchUrl, headers } = this.config
    const encoding = this.getSiteEncoding()

    return () => {
      return invokeCFBypass(
        searchUrl,
        'post',
        { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
        `do=search&subaction=search&story=${urlencode.encode(query, encoding)}`
      )
    }
  }

  override crawlerInfoRequestGenerator(): RequestGenerator {
    return (url) => {
      return invokeCFBypass(url)
    }
  }
}

export default DataLifeProvider