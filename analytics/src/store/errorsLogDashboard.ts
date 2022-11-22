import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import { DATE_FORMAT } from '../constants'
import { Searcher, searchLogs } from '../database/cloudwatch'
import periodStore from './periodStore'

const today = moment().utc()
const getPeriodRange = (period: string): number[] => {
  switch (period) {
    case 'last7days': return [
      today.clone().subtract(7, 'day').valueOf(),
      today.valueOf(),
    ]
    case 'last30days': return [
      today.clone().subtract(30, 'day').valueOf(),
      today.valueOf(),
    ]
    case 'current_month': return [
      today.clone().subtract(1, 'month').valueOf(),
      today.valueOf(),
    ]
    case 'previous_month': return [
      today.clone().subtract(1, 'month').valueOf(),
      today.clone().subtract(2, 'month').valueOf(),
    ]
    case 'last3months': return [
      today.clone().subtract(3, 'month').valueOf(),
      today.valueOf(),
    ]
  }

  const date = moment(period, DATE_FORMAT).utc()
  const from = date.valueOf()
  const now = Date.now()
  const to = date.clone().add(1, 'day').valueOf()

  return [
    from,
    to > now ? now : to
  ]
}

const cache: Record<string, Searcher> = {}

class ErrorsLogDashboardStore {
  searcher: Searcher | null = null

  constructor() {
    makeAutoObservable(this)
  }

  load(period: string): void {
    periodStore.setPeriod(period)
    this.reload()
  }

  reload(force = false): void {
    const period = periodStore.period

    if (!force && cache[period]) {
      this.searcher = cache[period]
      return
    }

    const [from, to] = getPeriodRange(period)

    let searcher = cache[period]
    if (!searcher) {
      searcher = searchLogs(from, to)
      cache[period] = searcher
    }

    searcher.reload()

    this.searcher = searcher
  }
}

export default new ErrorsLogDashboardStore()
