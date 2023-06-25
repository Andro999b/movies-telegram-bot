import { REGION, ACCOUNT_ID } from '../constants'
import { Lambda } from '@aws-sdk/client-lambda'
import { getCredentialProvider } from './userpool'
import { GAStatistic, MongoStats } from '../types'

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

export const getLambda = async (): Promise<Lambda> => {
  const credentials = await getCredentialProvider()
  return new Lambda({ apiVersion: '2015-03-31', region: REGION, credentials })
}

export const invokeGA = async (from: string, to: string): Promise<GAStatistic> => {
  const lambda = await getLambda()
  const { Payload } = await lambda.invoke({
    FunctionName: `arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:analytics-functions-dev-ga4`,
    Payload: textEncoder.encode((JSON.stringify({ from, to })))
  })

  return JSON.parse(textDecoder.decode(Payload))
}

export const invokeMongoStat = async (): Promise<MongoStats> => {
  const lambda = await getLambda()
  const { Payload } = await lambda.invoke({
    FunctionName: `arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:analytics-functions-dev-mongostat`
  })

  return JSON.parse(textDecoder.decode(Payload))
}

export const invokeMongoInvalidate = async (provider: string, resultId: string): Promise<void> => {
  const lambda = await getLambda()
  await lambda.invoke({
    FunctionName: `arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:analytics-functions-dev-mongoinvalidate`,
    Payload: textEncoder.encode(JSON.stringify({ provider, resultId }))
  })
}
