const providers = [
    new (require('./SeasonvarProvider'))(),
    new (require('./SevenSerialsProvider'))(),
    new (require('./KinogoProvider'))(),
    new (require('./Kinogo2Provider'))(),
    new (require('./KinovodProvider'))(),
    new (require('./AnimeVostProvider'))(),
    new (require('./AnimediaProvider'))(),
    new (require('./AnidubProvider'))(),
    new (require('./AnigatoProvider'))(),
    new (require('./VideoCDNProvider'))(),
    new (require('./NekomoriProvider'))()
]

const MAX_RESULTS = 30

module.exports = {
    getProviders() {
        return providers.map((provider) => provider.getName())
    },
    async getProvider(name) {
        const provider = providers.find((provider) => provider.getName() == name)
        if (provider) {
            return Promise.resolve(provider)
        }
        return Promise.reject(`No provider found for ${name}`)
    },
    async search(providers, query, page = 0, pageCount = MAX_RESULTS) {
        if (!query || !providers || !providers.length) {
            return []
        }

        const results = await Promise.all(providers.map(async (providerName) => {
            try {
                const provider = await this.getProvider(providerName)
                const results = await provider.search(query, page, pageCount)
                return results.slice(0, pageCount)
            } catch (e) {
                console.error(`Provider ${providerName} failed.`, e)
                return []
            }
        }))

        return results.reduce((acc, result) => acc.concat(result), [])
    },
    async searchOne(providerName, query, page = 0, pageCount = MAX_RESULTS) {
        if (!query) {
            return []
        }

        try {
            const provider = await this.getProvider(providerName)
            const results = await provider.search(query, page, pageCount)
            return results.slice(0, pageCount)
        } catch (e) {
            console.error(`Provider ${providerName} failed.`, e)
        }

        return []
    },
    async getInfo(providerName, resultsId) {
        const provider = await this.getProvider(providerName)
        return provider.getInfo(resultsId)
    },
    async getSource(providerName, resultsId, sourceId) {
        const provider = await this.getProvider(providerName)
        return provider.getSource(resultsId, sourceId)
    }
}