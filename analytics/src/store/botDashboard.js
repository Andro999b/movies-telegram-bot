import { getBucketKeys } from '../utils'
import { observable } from 'mobx'
import WebworkerPromise from 'webworker-promise'
import Worker from './botDashboard.worker'
import periodStore from './periodStore'

const worker = new WebworkerPromise(new Worker())

const toTopUsersPie = (bucket) =>
    Object
        .keys(bucket)
        .map((key) => bucket[key])
        .sort((a, b) => b.value - a.value)

const periodsCache = {}

export default observable({
    error: null,
    loading: true,

    usersChart: [],
    topUsers: [],

    botPie: [],
    botChart: [],
    bots: [],
    languagePie: [],

    eventsPie: [],
    eventsChart: [],
    events: [],

    load(period) {
        periodStore.setPeriod(period)
        this.reload()
    },

    reload(force) {
        const period = periodStore.period

        const updateCharts = ({
            eventsBucket,
            eventsCountBucket,
            botsBucket,
            botsCountBucket,
            usersLanguagesBucket,
            usersBucket,
            topUsersBucket
        }) => {
            if (periodStore.period != period) return

            this.eventsChart = eventsBucket.chartData || []
            this.eventsPie = eventsCountBucket.chartData || []
            this.events = getBucketKeys(eventsCountBucket)

            this.botChart = botsBucket.chartData || []
            this.botPie = botsCountBucket.chartData || []
            this.bots = getBucketKeys(botsCountBucket)
            this.languagePie = usersLanguagesBucket.chartData
                .map(({ seg, count }) => ({ key: seg, value: count}))

            this.usersChart = usersBucket.chartData || []
            this.topUsers = toTopUsersPie(topUsersBucket)

            this.loading = false
        }

        if (!force && periodsCache[period]) {
            updateCharts(periodsCache[period])
            return
        }

        this.loading = true
        this.error = null
        
        worker
            .postMessage({
                period,
                credentials: AWS.config.credentials.params
            })
            .then((acc) => {
                periodsCache[period] = acc
                updateCharts(acc)
            })
            .catch((error) => this.error = error.message)
    }
})