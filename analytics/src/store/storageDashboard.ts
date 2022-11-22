import { makeAutoObservable } from 'mobx'
import { invokeMongoStat, invokeMongoInvalidate } from '../database/lambda'
import { ChartData, Counting, MongoStatsCount, MongoStatsHits, MongoStatsRecient } from '../types'
import { bucketInitState, segmentBucketReducer } from '../utils'

const providerReducer = segmentBucketReducer<MongoStatsCount>(
  ({ _id }) => _id,
  ({ _id }) => _id,
  (acc, { count }) => acc + count
)

class StorageDashboardStore {
  error: string | null = null
  initlized = false
  loading = true
  providersChart: ChartData<Counting> = []
  providersHitsChart: ChartData<Counting> = []
  providers: string[] = []
  top: MongoStatsHits[] = []
  recient: MongoStatsRecient[] = []
  total = 0

  constructor() {
    makeAutoObservable(this)
  }

  invalidate(provider: string, resultId: string): void {
    this.loading = true
    this.error = null

    invokeMongoInvalidate(provider, resultId)
      .then(() => this.reload(true))
      .catch((error) => this.error = error.message)
  }

  reload(force = false): void {
    if (!force && this.initlized) return

    this.loading = true
    this.error = null

    invokeMongoStat()
      .then(({ providers, providersHits, hits, recient }) => {
        this.initlized = true
        this.loading = false

        const providersBucket = providers.reduce(providerReducer, bucketInitState())
        const providersHitsBucket = providersHits.reduce(providerReducer, bucketInitState())

        this.total = providers.reduce((acc: number, { count }) => acc + count, 0)
        this.providersChart = providersBucket.chartData
        this.providersHitsChart = providersHitsBucket.chartData
        this.providers = Object.keys(providersBucket.acc)
        this.top = hits
        this.recient = recient
      })
      .catch((error) => this.error = error.message)
  }
}

export default new StorageDashboardStore()
