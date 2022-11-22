import { getBucketKeys, sortCountingData, sortPieData } from '../utils'
import { action, makeAutoObservable, makeObservable, observable } from 'mobx'
import { PWBHost } from 'promise-worker-bi'
//@ts-ignore
import BotDashboardWorker from './botDashboard.worker'
import periodStore from './periodStore'
import { ChartData, Counting, PieData, Unique } from '../types/index'
import { UsersEventCount, WorkerRequest, WorkerResult } from '../types/worker'
import { getCredentialProvider } from '../database/userpool'

const promiseWorker = new PWBHost(new BotDashboardWorker())

const toTopUsersPie = (bucket: Record<string, UsersEventCount>): UsersEventCount[] =>
  Object
    .keys(bucket)
    .map((key) => bucket[key])
    .sort((a, b) => b.value - a.value)


const periodsCache: Record<string, WorkerResult> = {}

class BotDashboard {
  error: string | null = null
  loading = false
  usersChart: ChartData<Unique> = []
  topUsers: UsersEventCount[] = []
  botPie: PieData[] = []
  botChart: ChartData<Counting> = []
  bots: string[] = []
  languagePie: PieData[] = []
  eventsPie: PieData[] = []
  eventsChart: ChartData<Counting> = []
  events: string[] = []

  constructor() {
    makeAutoObservable(this)
  }

  load(period: string): void {
    periodStore.setPeriod(period)
    this.reload()
  }

  reload(force = false): void {
    const period = periodStore.period

    if (!force && periodsCache[period]) {
      this.updateCharts(period, periodsCache[period])
      return
    }

    this.loading = true
    this.error = null

    getCredentialProvider()
      .then((cp) => cp())
      .then((credentials) => {
        const request: WorkerRequest = { period, credentials }
        return promiseWorker.postMessage(request)
      })
      .then((acc) => {
        periodsCache[period] = acc
        this.updateCharts(period, acc)
      })
      .catch((error) => {
        this.setError(error)
      })
  }

  private updateCharts(period: string, {
    eventsBucket,
    eventsCountBucket,
    botsBucket,
    botsCountBucket,
    usersLanguagesBucket,
    usersBucket,
    topUsersBucket
  }: WorkerResult): void {
    if (periodStore.period != period)
      return

    this.eventsChart = sortCountingData(eventsBucket.chartData || [])
    this.eventsPie = sortPieData(eventsCountBucket.chartData || [])
    this.events = getBucketKeys(eventsCountBucket)

    this.botChart = sortCountingData(botsBucket.chartData || [])
    this.botPie = sortPieData(botsCountBucket.chartData || [])
    this.bots = getBucketKeys(botsCountBucket)
    this.languagePie = usersLanguagesBucket
      .chartData
      .map(({ seg, count }) => ({ key: seg, value: count } as PieData))

    this.usersChart = usersBucket.chartData || []
    this.topUsers = toTopUsersPie(topUsersBucket)

    this.loading = false
  }

  private setError(error: string | Error): void {
    if (typeof error === 'string')
      this.error = error
    else
      this.error = error.message
  }
}

export default new BotDashboard()
