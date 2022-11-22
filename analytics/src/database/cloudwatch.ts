import { LOG_GROUPS, REGION } from '../constants'
import { observable } from 'mobx'
import { CloudWatchLogs, QueryStatistics, ResultField } from '@aws-sdk/client-cloudwatch-logs'
import { getCredentialProvider } from './userpool'

export const getCloudWatch = async (): Promise<CloudWatchLogs> => {
  const credentials = await getCredentialProvider()
  return new CloudWatchLogs({ region: REGION, credentials })
}

export interface Searcher {
  logs: ResultField[][]
  statistics: QueryStatistics | null
  status: string | null
  loading: boolean
  error: string | null

  reload: () => void
}

export const searchLogs = (from: number, to: number): Searcher => {
  const isQueryRunning = (status: string | null): boolean => status != null && (status == 'Scheduled' || status == 'Running')

  const searcher: Searcher = {
    logs: [],
    statistics: null,
    status: null,
    loading: false,
    error: null,

    reload(): void {
      if (this.loading) return

      this.error = null
      this.loading = true

      getCloudWatch().then((cloudwatchlogs) => {


        let queryId: string | undefined
        let intervalId: NodeJS.Timer | undefined

        const checkResults = (): void => {
          cloudwatchlogs.getQueryResults({ queryId }, (err, data) => {
            if (err) {
              this.loading = false
              this.error = err.message
              clearInterval(intervalId)
              return
            } else {
              this.status = data!.status!
              if (!isQueryRunning(this.status)) {
                this.loading = false
                clearInterval(intervalId)
              }
              this.logs = data!.results!
              this.statistics = data!.statistics!
            }
          })
        }

        cloudwatchlogs.startQuery({
          startTime: from,
          endTime: to,
          queryString: 'fields @timestamp, @message, @log | filter @message like /ERROR/ | sort @timestamp desc',
          logGroupNames: LOG_GROUPS
        }, (err, data) => {
          if (err) {
            this.error = err.message
            return
          } else {
            this.status = 'Scheduled'
            queryId = data!.queryId
            intervalId = setInterval(checkResults, 1000)
          }
        })

      })
    }
  }

  return observable(searcher)
}
