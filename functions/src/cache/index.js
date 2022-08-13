const mongoDBCache = require('./mongoDBCache')

const caches = {}
const getCache = async (cacheName) => {
    let cache = caches[cacheName]

    if(!cache) {
        cache = await mongoDBCache(cacheName)
        caches[cacheName] = cache
    }

    return cache
}

module.exports = {
    getCache,
    getCachedInfo: async (provider, resultId, compute) => {
        const cache = await getCache('info')
        return cache.getOrCompute(
            [provider, resultId], 
            compute, 
            (result) => !result.files || result.files.length == 0
        )
    },
    getCachedSource: async (provider, resultId, sourceId, compute) => {
        const cache = await getCache('source')
        return cache.getOrCompute(
            [provider, resultId, sourceId], 
            compute
        )
    },
    getCachedSearch: async (provider, query, compute) => {
        const cache = await getCache('search')
        return cache.getOrCompute(
            [provider, query], 
            compute
        )
    }
}