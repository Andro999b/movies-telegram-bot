import { DATE_FORMAT, GA_DATE_FORMAT, PERIODS } from '../constants'
import moment from 'moment'
import { observable } from 'mobx'

const today = moment()

export default observable({
    period: today.format(DATE_FORMAT),
    gaPeriod: today.format(GA_DATE_FORMAT),
    date: today.toDate(),

    setPeriod(period) {
        if(PERIODS.includes(period)) {
            this.period = period
            this.gaPeriod = period
        } else {
            const momentInst = moment(period, DATE_FORMAT)
            this.period = period
            this.date = momentInst.toDate()
            this.gaPeriod = momentInst.format(GA_DATE_FORMAT)
        }
    },

    getFormatedDate() {
        return moment(this.date).format(DATE_FORMAT)
    },

    setDate(date) {
        const momentInst = moment(date)

        this.date = date
        this.period = momentInst.format(DATE_FORMAT)
        this.gaPeriod = momentInst.format(GA_DATE_FORMAT)
    }
})