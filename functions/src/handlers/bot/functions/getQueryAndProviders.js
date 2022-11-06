export const PAGE_SEPARATOR = '$'

export default (query, avaliableProviders) => {
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

      if (avaliableProviders.indexOf(provider) != -1) {
        return { query: q.trim(), providers: [provider], page }
      }
    }
  }

  return { query: query.trim(), providers: avaliableProviders, page }
}