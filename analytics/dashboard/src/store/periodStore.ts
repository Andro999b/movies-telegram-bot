import { DATE_FORMAT, GA_DATE_FORMAT, PERIODS } from '../constants'
import moment from 'moment'
import { action, makeObservable, observable } from 'mobx'

const today = moment()

class PeriodStore {
  @observable period = today.format(DATE_FORMAT)
  @observable gaPeriod = today.format(GA_DATE_FORMAT)
  @observable date = today.toDate()
  @observable isDateRange = false

  constructor() {
    makeObservable(this)
  }

  @action.bound
  setPeriod(period: string): void {
    if (PERIODS.includes(period)) {
      this.period = period
      this.gaPeriod = period
      this.isDateRange = true
    } else {
      const momentInst = moment(period, DATE_FORMAT)
      this.period = period
      this.date = momentInst.toDate()
      this.gaPeriod = momentInst.format(GA_DATE_FORMAT)
      this.isDateRange = false
    }
  }

  getFormatedDate(): string {
    return moment(this.date).format(DATE_FORMAT)
  }

  @action.bound
  setDate(date: Date): void {
    const momentInst = moment(date)

    this.date = date
    this.period = momentInst.format(DATE_FORMAT)
    this.gaPeriod = momentInst.format(GA_DATE_FORMAT)
  }
}

export default new PeriodStore()
