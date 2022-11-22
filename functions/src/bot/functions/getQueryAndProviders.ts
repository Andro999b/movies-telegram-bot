import { ProvidersNames } from '../../types/providersConfig'
import { QueryAndProviders } from '../types'

export const PAGE_SEPARATOR = '$'

export default (query: string, avaliableProviders: ProvidersNames[]): QueryAndProviders => {
  let page = 1

  if (query.startsWith('#')) {
    const sepIndex = query.indexOf(' ')
    if (sepIndex != -1) {
      let provider = query.substring(1, sepIndex - 1)
      const pageSep = provider.indexOf(PAGE_SEPARATOR)
      if (pageSep != -1) {
        page = parseInt(query.substring(provider.length + 1, sepIndex))
        if (isNaN(page)) page = 1

        provider = provider.substring(0, pageSep)
      }

      const q = query.substring(sepIndex + 1)

      if (avaliableProviders.indexOf(provider as ProvidersNames) != -1) {
        return { query: q.trim(), providers: [provider as ProvidersNames], page }
      }
    }
  }

  return { query: query.trim(), providers: avaliableProviders, page }
}