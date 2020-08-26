import { observable } from 'mobx'
import { invokeMongoStat } from '../database/lambda'
import { segmentBucketReducer } from '../utils'


const providerReducer = segmentBucketReducer(({ _id }) => _id, ( { _id }) => _id, (acc, { count}) => acc + count)

export default observable({
    initlized: false,
    loading: true,
    providersChart: [],
    providers: [],
    top: [],
    recient: [],
    total: 0,

    reload(force) {
        if(!force && this.initlized) return

        this.loading = true

        invokeMongoStat()
            .then(({ providers, hits, recient }) => {
                this.initlized = true
                this.loading = false

                const providersBucket = providers.reduce(providerReducer, {})

                this.total = providers.reduce((acc, { count }) => acc + count, 0)
                this.providersChart = providersBucket.chartData
                this.providers = Object.keys(providersBucket.acc)
                this.top = hits
                this.recient = recient
            })
    }
})