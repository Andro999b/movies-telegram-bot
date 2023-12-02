import CrawlerProvider from './CrawlerProvider'
import urlencode from 'urlencode'
import invokeCFBypass from '../utils/invokeCFBypass'
import { ProviderConfig } from '../types/index'
import { RequestGenerator, superagentWithCharset } from '../utils/crawler'
import { tunnelHttpsAgent } from '../utils/tunnelAgent'

abstract class DataLifeProvider<Config extends ProviderConfig = ProviderConfig> 
  extends CrawlerProvider<Config> {
  protected infoScope = '#dle-content'

  override getSearchUrl(): string {
    return ''
  }

  protected getSiteEncoding(): string {
    return 'utf8'
  }

  protected searchMethod: 'get' | 'post' = 'post'

  override crawlerSearchRequestGenerator(query: string): RequestGenerator {
    const { searchUrl, headers, timeout, bypassMode } = this.config

    if (bypassMode == 'cf') {
      return this.cfSearchRequestGenerator(query)
    }

    const encoding = this.getSiteEncoding()

    return () => {
      const request = superagentWithCharset
        .post(searchUrl!)
        .agent(bypassMode == 'proxy' ? tunnelHttpsAgent: undefined)
        .type('form')
        .field({
          do: 'search',
          subaction: 'search',
          search_start: 0,
          full_search: 0,
          result_from: 1,
          story: encoding ? urlencode.encode(query, encoding) : query
        })
        .disableTLSCerts()
        .buffer(true)
        .charset()
        .timeout(timeout!)
        .set(headers!)

      return request
    }
  }

  private cfSearchRequestGenerator(query: string): RequestGenerator {
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

  override crawlerInfoRequestGenerator(): RequestGenerator | undefined {
    const { bypassMode } = this.config

    if (bypassMode == 'cf') {
      return (url) => {
        return invokeCFBypass(url)
      }
    }
    
     return
  }
}

export default DataLifeProvider