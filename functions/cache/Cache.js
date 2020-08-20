
module.exports = class Cache {
    async getOrCompute(keys, compute, isEmpty = () => false) { // eslint-disable-line
        return compute(keys)
    }
    async putToCacheMultiple(results) { // eslint-disable-line

    }
    async putToCache(id, result) { // eslint-disable-line

    }
    async get(id) { // eslint-disable-line
    }
}