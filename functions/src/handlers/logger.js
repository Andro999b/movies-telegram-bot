const makeResponse = require('../utils/makeResponse')
const isOriginAllowed = require('../utils/isOriginAllowed')
const AWS = require('aws-sdk')
const cloudwatchlogs = new AWS.CloudWatchLogs({ apiVersion: '2014-03-28' })

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

    if (!isOriginAllowed(event))
        return makeResponse('forbiden', 403)

    await log(event.body)
    return makeResponse('ok', 200, {
        'Access-Control-Allow-Origin': origin
    })
}