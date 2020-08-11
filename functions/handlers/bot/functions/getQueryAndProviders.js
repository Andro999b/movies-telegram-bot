module.exports =  (query, avaliableProviders) => {
    if (query.startsWith('#')) {
        const sepIndex = query.indexOf(' ')
        if (sepIndex != -1) {
            const provider = query.substr(1, sepIndex - 1)
            const q = query.substr(sepIndex + 1)

            if (avaliableProviders.indexOf(provider) != -1) {
                return { query: q.trim(), providers: [provider] }
            }
        }
    }

    return { query: query.trim(), providers: avaliableProviders }
}
