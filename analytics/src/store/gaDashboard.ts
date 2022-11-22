import { makeAutoObservable, observable } from 'mobx'
import { invokeGA } from '../database/lambda'
import { segmentBucketReducer, bucketReducer, bucketInitState, sortCountingData } from '../utils'
import { GA_DATE_FORMAT } from '../constants'
import moment from 'moment'
import periodStore from './periodStore'
import { Bucket, ChartData, Counting, GAKeys, PieData, Seg, Unique } from '../types'

const hoursSegFormatter = (hour: string): string => hour + ':00'
const dateSegFormatter = (date: string): string =>
  date.substring(0, 4) + '-' + date.substring(4, 6) + '-' + date.substring(6, 8)

const reformatBucketSegments = (bucket: Bucket<Counting | Unique>, formatter: (seg: Seg) => string): void =>
  bucket.chartData.forEach((item) => item.seg = formatter(item.seg))

export interface Label {
  name: string
  value: string
}

interface ParseResult {
  labels: Label[]
  usersBucket: Bucket<Counting>
  eventsCountBucket: Bucket<Counting>
  countriesCountBucket: Bucket<PieData>
  eventsBucket: Bucket<Counting>
  sessionsBucket: Bucket<Counting>
  deviceCountBucket: Bucket<PieData>
  totalEvents: number
}

const parseResult = (
  segment: string,
  { new_users, users, countries, sessions, devices, events, labels }: Record<GAKeys, string[]>
): ParseResult => {
  const segFormatter = segment == 'date' ? dateSegFormatter : hoursSegFormatter

  //users chart
  let usersBucket = bucketInitState<Counting>()
  usersBucket = users.reduce(
    segmentBucketReducer(
      (row) => row[0],
      () => 'users',
      (acc, row) => acc + parseInt(row[1])
    ),
    usersBucket
  )

  usersBucket = new_users.reduce(
    segmentBucketReducer(
      (row) => row[0],
      () => 'new_users',
      (acc, row) => acc + parseInt(row[1])
    ),
    usersBucket
  )

  //countries chart
  const countriesCountBucket = countries.reduce(
    bucketReducer(
      (row) => row[0],
      (acc, row) => acc + parseInt(row[1])
    ),
    bucketInitState()
  )

  //sessions chart
  const sessionsBucket = sessions.reduce(
    segmentBucketReducer(
      (row) => row[0],
      () => 'sessions',
      (acc, row) => acc + parseInt(row[1])
    ),
    bucketInitState()
  )

  //events
  const eventsBucket = events.reduce(
    segmentBucketReducer(
      (row) => row[0],
      (row) => row[1],
      (acc, row) => acc + parseInt(row[2])
    ),
    bucketInitState()
  )

  const totalEvents = events.reduce((acc, row) => acc + parseInt(row[2]), 0)

  const eventsCountBucket = events.reduce(
    segmentBucketReducer(
      (row) => row[1],
      (row) => row[1],
      (acc, row) => acc + parseInt(row[2])
    ),
    bucketInitState()
  )

  //device 
  const deviceCountBucket = devices.reduce(
    bucketReducer(
      (row) => row[0],
      (acc, row) => acc + parseInt(row[1])
    ),
    bucketInitState()
  )

  reformatBucketSegments(usersBucket, dateSegFormatter)
  reformatBucketSegments(eventsBucket, segFormatter)
  reformatBucketSegments(sessionsBucket, segFormatter)

  return {
    labels: labels.map(([name, value]) => ({ name, value })),
    usersBucket,
    eventsCountBucket,
    countriesCountBucket,
    eventsBucket,
    sessionsBucket,
    deviceCountBucket,
    totalEvents
  }
}

const today = moment()
const todayFormated = moment().format(GA_DATE_FORMAT)
const getGARange = (period: string): string[] => {
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

  return [
    period,
    period
  ]
}


const cache: Record<string, ParseResult> = {}

class GADashboardStore {
  error: string | null = null
  loading = true
  usersChart: ChartData<Counting> = []
  countries: PieData[] = []
  sessionsChart: ChartData<Counting> = []
  eventsChart: ChartData<Counting> = []
  eventsData: ChartData<Counting> = []
  eventsLines: string[] = []
  events: string[] = []
  devicePie: ChartData<PieData> = []
  totalEvents = 0
  totalSessions = 0
  totalUsers = 0
  labels: Label[] = []

  constructor() {
    makeAutoObservable(this)
  }

  load(period: string): void {
    periodStore.setPeriod(period)
    this.reload()
  }

  reload(force = false): void {
    const period = periodStore.gaPeriod

    if (!force && cache[period]) {
      this.updateCharts(period, cache[period])
      return
    }

    this.loading = true
    this.error = null

    const [from, to] = getGARange(period)

    invokeGA(from, to)
      .then(({ segment, results }) => {
        this.loading = false
        return parseResult(
          segment,
          results.reduce(
            (acc, { key, result }) => ({ ...acc, [key]: result || [] }),
            {} as Record<GAKeys, string[]>
          )
        )
      })
      .then((data) => {
        cache[period] = data
        this.updateCharts(period, data)
      })
      .catch((error) => this.error = error.message)
  }

  private updateCharts(period: string, {
    labels,
    usersBucket,
    countriesCountBucket,
    eventsCountBucket,
    eventsBucket,
    sessionsBucket,
    deviceCountBucket,
    totalEvents
  }: ParseResult): void {
    if (periodStore.gaPeriod != period) return

    const countries = countriesCountBucket.chartData
      .sort((a, b) => b.value - a.value)


    if (countries.length > 5) {
      const others = countries.slice(5)
        .reduce((acc, { value }) => acc + value, 0)

      this.countries = countries.slice(0, 5)
        .concat({ key: 'Other', value: others })
    } else {
      this.countries = countries
    }

    const sortedEventsCounts = sortCountingData(eventsCountBucket.chartData)
    this.labels = labels
    this.usersChart = usersBucket.chartData
    this.sessionsChart = sessionsBucket.chartData
    this.totalSessions = sessionsBucket.chartData.reduce((acc, { sessions }) => acc + sessions, 0)
    this.eventsChart = eventsBucket.chartData
    this.eventsData = sortCountingData(eventsCountBucket.chartData)
    this.events = sortedEventsCounts.map(({ seg }) => seg)
    this.totalEvents = totalEvents
    this.devicePie = deviceCountBucket.chartData
    this.totalUsers = deviceCountBucket.chartData.reduce((acc, { value }) => acc + value, 0)
  }
}

export default new GADashboardStore()
