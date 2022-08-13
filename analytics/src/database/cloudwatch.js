import { LOG_GROUPS, REGION } from '../constants'
import { observable } from 'mobx'

export const getCloudWatch = () => new AWS.CloudWatchLogs({ region: REGION })

export const searchLogs = (from, to) => {
    const cloudwatchlogs = getCloudWatch()
    const isQueryRunning = (status) => status && (status == 'Scheduled' || status == 'Running')

    const searcher = observable({
        logs: [],
        statistics: null,
        status: null,
        loading: false,
        error: null,

        reload() {
            if (this.loading) return

            this.error = null
            this.loading = true

            let queryId = null
            let intervalId = null

            const checkResults = () => {
                cloudwatchlogs.getQueryResults({ queryId }, (err, data) => {
                    if(err) {
                        this.loading = false
                        this.error = err.message
                        clearInterval(intervalId)
                        return
                    } else {
                        this.status = data.status
                        if(!isQueryRunning(this.status)) {
                            this.loading = false
                            clearInterval(intervalId)
                        }
                        this.logs = data.results
                        this.statistics = data.statistics
                    }
                })
            }

            cloudwatchlogs.startQuery({
                startTime: from,
                endTime: to,
                queryString: 'fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc',
                logGroupNames: LOG_GROUPS
            }, (err,data) => {
                if(err) {
                    this.error = err.message
                    return
                } else {
                    this.status = 'Scheduled'
                    queryId = data.queryId
                    intervalId = setInterval(checkResults, 1000)
                }
            })
        }
    })

    return searcher
}