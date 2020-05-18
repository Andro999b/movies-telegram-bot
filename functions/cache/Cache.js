
module.exports = class Cache {
    async getOrCompute(keys, compute) {
        return compute(keys)
    }
}