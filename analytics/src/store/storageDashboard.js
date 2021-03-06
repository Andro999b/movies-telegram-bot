import { observable } from 'mobx'
import { invokeMongoStat, invokeMongoInvalidate } from '../database/lambda'
import { segmentBucketReducer } from '../utils'

const providerReducer = segmentBucketReducer(({ _id }) => _id, ( { _id }) => _id, (acc, { count}) => acc + count)

export default observable({
    error: null,
    initlized: false,
    loading: true,
    providersChart: [],
    providersHitsChart: [],
    providers: [],
    top: [],
    recient: [],
    total: 0,

    invalidate(provider, resultId) {
        this.loading = true
        this.error = null

        invokeMongoInvalidate(provider, resultId)
            .then(() => this.reload(true))
            .catch((error) => this.error = error.message) 
    },

    reload(force) {
        if(!force && this.initlized) return

        this.loading = true
        this.error = null

        invokeMongoStat()
            .then(({ providers, providersHits, hits, recient }) => {
                this.initlized = true
                this.loading = false

                const providersBucket = providers.reduce(providerReducer, {})
                const providersHitsBucket = providersHits.reduce(providerReducer, {})

                this.total = providers.reduce((acc, { count }) => acc + count, 0)
                this.providersChart = providersBucket.chartData
                this.providersHitsChart = providersHitsBucket.chartData
                this.providers = Object.keys(providersBucket.acc)
                this.top = hits
                this.recient = recient
            })
            .catch((error) => this.error = error.message) 
    }
})