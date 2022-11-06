import CrawlerProvider from './CrawlerProvider'
import urlencode from 'urlencode'
import { ProviderConfig } from '../types'
import { RequestGenerator, superagentWithCharset } from '../utils/crawler'

abstract class DataLifeProvider<Config extends ProviderConfig = ProviderConfig> extends CrawlerProvider<Config> {
  protected infoScope = '#dle-content'

  override getSearchUrl(): string {
    return ''
  }

  protected getSiteEncoding(): string | null {
    return null
  }

  override crawlerSearchRequestGenerator(query: string): RequestGenerator {
    const { searchUrl, headers, timeout } = this.config
    const encoding = this.getSiteEncoding()

    return () => {
      const request = superagentWithCharset
        .post(searchUrl!)
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
}

export default DataLifeProvider