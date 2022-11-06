import CrawlerProvider from './CrawlerProvider.js'
import urlencode from 'urlencode'
import invokeCFBypass from '../utils/invokeCFBypass.js'
import { ProviderConfig } from '../types/index.js'
import { RequestGenerator } from '../utils/crawler.js'

abstract class DataLifeProvider<Config extends ProviderConfig = ProviderConfig> extends CrawlerProvider<Config> {
  protected infoScope = '#dle-content'

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