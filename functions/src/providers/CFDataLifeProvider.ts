import CrawlerProvider from './CrawlerProvider'
import urlencode from 'urlencode'
import invokeCFBypass from '../utils/invokeCFBypass'
import { ProviderConfig } from '../types/index'
import { RequestGenerator } from '../utils/crawler'

export type SearchMethod = 'get' | 'post'

abstract class DataLifeProvider<Config extends ProviderConfig = ProviderConfig> extends CrawlerProvider<Config> {
  protected infoScope = '#dle-content'

  override getSearchUrl(): string {
    return ''
  }

  protected getSiteEncoding(): string {
    return 'utf8'
  }

  protected searchMethod: SearchMethod = 'get'

  override crawlerSearchRequestGenerator(query: string): RequestGenerator {
    const { searchUrl, headers } = this.config
    const encoding = this.getSiteEncoding()

    if (this.searchMethod == 'post') {
      return () =>
        invokeCFBypass(
          searchUrl,
          'post',
          { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
          `do=search&subaction=search&story=${urlencode.encode(query, encoding)}`
        )
    } else {
      const url = new URL(searchUrl)
      url.searchParams.append('do', 'search')
      url.searchParams.append('subaction', 'search')
      url.searchParams.append('story', urlencode.encode(query, encoding))
      const urlString = url.toString()
      return () => invokeCFBypass(urlString)
    }
  }

  override crawlerInfoRequestGenerator(): RequestGenerator {
    return (url) => {
      return invokeCFBypass(url)
    }
  }
}

export default DataLifeProvider