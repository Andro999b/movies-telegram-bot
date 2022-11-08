import makeResponse from '../utils/makeResponse.js'
import isOriginAllowed from '../utils/isOriginAllowed.js'
import AWS from 'aws-sdk'
import { APIGatewayProxyHandler } from 'aws-lambda'
import { SequenceToken } from 'aws-sdk/clients/cloudwatchlogs'
const cloudwatchlogs = new AWS.CloudWatchLogs({ apiVersion: '2014-03-28' })

const LOG_GROUP = process.env.LOG_GROUP
const LOG_STREAM = process.env.LOG_STREAM || 'logs-stream'


const getSequenceToken = (): Promise<SequenceToken | undefined> => {
  return new Promise((resolve, reject) => {
    cloudwatchlogs.describeLogStreams(
      {
        logGroupName: LOG_GROUP,
        logStreamNamePrefix: LOG_STREAM
      },
      (err, data) => {
        if (err) reject(err)
        else if (!data || !data.logStreams) resolve(undefined)
        else resolve(data.logStreams[0].uploadSequenceToken)
      }
    )
  })
}

const log = async (message: string | null): Promise<void> => {
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
        else resolve(undefined)
      }
    )
  })

}

export const handler: APIGatewayProxyHandler = async (event) => {
  const origin = event.headers.origin

  if (!isOriginAllowed(event))
    return makeResponse('forbiden', 403)

  await log(event.body)
  return makeResponse('ok', 200, {
    'Access-Control-Allow-Origin': origin
  })
}