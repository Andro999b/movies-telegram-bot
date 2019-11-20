const providers = [
    new (require('./KinokradProvider'))(),
    new (require('./HDRezkaProvider'))(),
    new (require('./KinogoProvider'))(),
    new (require('./BaskinoProvider'))()
]

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
    async search(providers, query, page = 0, pageCount = 1) {
        const results = await Promise.all(providers.map(async (providerName) => {
            try{
                const provider = await this.getProvider(providerName)
                return await provider.search(query, page, pageCount)
            } catch(e) {
                console.error(`Provider ${providerName} failed.`, e.message, e.stack)
                return []
            }
        }))

        return results.reduce((acc, result) => acc.concat(result), [])
    },
    async getInfo(providerName, resultsId) {
        const provider = await this.getProvider(providerName)
        return await provider.getInfo(resultsId)
    }
}