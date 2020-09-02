import { observable } from 'mobx'
import { invokeGA } from '../database/lambda'
import { segmentBucketReducer, bucketReducer } from '../utils'
import { GA_DATE_FORMAT } from '../constants'
import moment from 'moment'

const hoursSegFormatter = (hour) => hour + ':00'
const dateSegFormatter = (date) => date.substring(0,4) + '-' + date.substring(4,6) + '-' + date.substring(6,8)

const reformatBucketSegments = (bucket, formatter) => 
    bucket.chartData.forEach((item) => item.seg = formatter(item.seg))

const parseResult = (segment, { newUsers, users, sessions, devices, events, labels }) => {
    const segFormatter = segment == 'ga:date' ? dateSegFormatter : hoursSegFormatter

    //users chart
    let usersBucket = {}
    usersBucket = users.reduce(
        segmentBucketReducer(
            (row) => row[0],
            () => 'users',
            (acc, row) => acc + parseInt(row[1])
        ),
        usersBucket
    )

    usersBucket = newUsers.reduce(
        segmentBucketReducer(
            (row) => row[0],
            () => 'newUsers',
            (acc, row) => acc + parseInt(row[1])
        ),
        usersBucket
    )

    //sessions chart
    const sessionsBucket = sessions.reduce(
        segmentBucketReducer(
            (row) => row[0],
            () => 'sessions',
            (acc, row) => acc + parseInt(row[1])
        ),
        {}
    )

    //events
    const eventsBucket = events.reduce(
        segmentBucketReducer(
            (row) => row[0],
            (row) => row[1],
            (acc, row) => acc + parseInt(row[2])
        ),
        {}
    )

    const eventsCountBucket = events.reduce(
        bucketReducer(
            (row) => row[1],
            (acc, row) => acc + parseInt(row[2])
        ),
        {}
    )

    //device 
    const deviceCountBucket = devices.reduce(
        bucketReducer(
            (row) => row[0],
            (acc, row) => acc + parseInt(row[1])
        ),
        {}
    )

    reformatBucketSegments(usersBucket, segFormatter)
    reformatBucketSegments(eventsBucket, segFormatter)
    reformatBucketSegments(sessionsBucket, segFormatter)

    return {
        labels: labels.map(([name, value]) => ({ name, value })),
        usersBucket,
        eventsCountBucket,
        eventsBucket,
        sessionsBucket,
        deviceCountBucket
    }
}

const today = moment().utc()
const todayFormated = moment().utc().format(GA_DATE_FORMAT)
const getGARange = (period) => {
    switch (period) {
        case 'last7days': return [
            today.clone().subtract(7, 'day').format(GA_DATE_FORMAT),
            todayFormated,
        ]
        case 'last30days': return [
            today.clone().subtract(30, 'day').format(GA_DATE_FORMAT),
            todayFormated,
        ]
        case 'current_month': return [
            today.clone().startOf('month').format(GA_DATE_FORMAT),
            todayFormated,
        ]
        case 'previous_month': return [
            today.clone().subtract(1, 'month').startOf('month').format(GA_DATE_FORMAT),
            today.clone().subtract(1, 'month').endOf('month').format(GA_DATE_FORMAT),
        ]
        case 'last3months': return [
            today.clone().subtract(2, 'month').startOf('month').format(GA_DATE_FORMAT),
            todayFormated,
        ]
    }
    return [period, period]
}


const cache = {}

export default observable({
    loading: true,
    usersChart: [],
    sessionsChart: [],
    eventsChart: [],
    eventsPie: [],
    events: [],
    devicePie: [],
    totalEvents: 0,
    totalSessions: 0,
    totalUsers: 0,
    labels: [],
    period: todayFormated,

    load(period) {
        this.period = period
        this.reload()
    },

    reload(force) {
        const period = this.period

        
        const updateCharts = ({
            labels,
            usersBucket,
            eventsCountBucket,
            eventsBucket,
            sessionsBucket,
            deviceCountBucket
        }) => {
            if (this.period != period) return

            this.labels = labels
            this.usersChart = usersBucket.chartData
            this.sessionsChart = sessionsBucket.chartData
            this.totalSessions = sessionsBucket.chartData.reduce((acc, { sessions }) => acc + sessions, 0)
            this.eventsChart = eventsBucket.chartData
            this.eventsPie = eventsCountBucket.chartData
            this.totalEvents = eventsCountBucket.chartData.reduce((acc, { value }) => acc + value, 0)
            this.devicePie = deviceCountBucket.chartData
            this.totalUsers = deviceCountBucket.chartData.reduce((acc, { value }) => acc + value, 0)
        }


        if (!force && cache[period]) {
            updateCharts(cache[period])
            return
        }

        this.loading = true

        const [from, to] = getGARange(period)

        invokeGA(from, to)
            .then(({ segment, results }) => {
                this.loading = false
                return parseResult(
                    segment,
                    results.reduce(
                        (acc, { key, result }) => ({ ...acc, [key]: result }), {}
                    )
                )
            })
            .then((data) => {
                cache[period] = data
                updateCharts(data)
            })
    }
})