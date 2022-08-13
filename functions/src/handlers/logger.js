const makeResponse = require('../utils/makeResponse')
const AWS = require('aws-sdk')
const cloudwatchlogs = new AWS.CloudWatchLogs({ apiVersion: '2014-03-28' })

const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS.split(',')
const LOG_GROUP = process.env.LOG_GROUP
const LOG_STREAM = process.env.LOG_STREAM || 'logs-stream'


const getSequenceToken = async () => {
    return new Promise((resolve, reject) => {
        cloudwatchlogs.describeLogStreams(
            {
                logGroupName: LOG_GROUP,
                logStreamNamePrefix: LOG_STREAM
            },
            (err, data) => {
                if (err) reject(err)
                else resolve(data.logStreams[0].uploadSequenceToken)
            }
        )
    })
}

const log = async (message) => {
    if (!message) return
    const sequenceToken = await getSequenceToken()
    return new Promise((resolve, reject) => {
        cloudwatchlogs.putLogEvents(
            {
                logEvents: [{
                    message,
                    timestamp: Date.now()
                }],
                logGroupName: LOG_GROUP,
                logStreamName: LOG_STREAM,
                sequenceToken
            },
            (err) => {
                if (err) reject(err)
                else resolve()
            }
        )
    })

}

module.exports.handler = async (event) => {
    const origin = event.headers.origin

    if (!origin || ALLOWED_DOMAINS.findIndex((domain) => origin.endsWith(domain)) == -1) {
        return makeResponse('forbiden', 403)
    } else {
        await log(event.body)
        return makeResponse('ok', 200, {
            'Access-Control-Allow-Origin': origin
        })
    }
}