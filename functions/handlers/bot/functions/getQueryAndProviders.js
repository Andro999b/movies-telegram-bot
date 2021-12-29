const PAGE_SEPARATOR = '$'

module.exports = (query, avaliableProviders) => {
    let page = 1

    if (query.startsWith('#')) {
        const sepIndex = query.indexOf(' ')
        if (sepIndex != -1) {
            let provider = query.substr(1, sepIndex - 1)
            const pageSep = provider.indexOf(PAGE_SEPARATOR)
            if(pageSep != -1) {
                page = parseInt(provider.substr(pageSep + 1))
                if(isNaN(page)) page = 1

                provider = provider.substr(0, pageSep)
            }

            const q = query.substr(sepIndex + 1)

            if (avaliableProviders.indexOf(provider) != -1) {
                return { query: q.trim(), providers: [provider], page }
            }
        }
    }

    return { query: query.trim(), providers: avaliableProviders, page }
}

module.exports.PAGE_SEPARATOR = PAGE_SEPARATOR