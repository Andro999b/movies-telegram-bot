
module.exports = class Cache {
    async getOrCompute(keys, compute, isEmpty = () => false) {
        return compute(keys)
    }
}