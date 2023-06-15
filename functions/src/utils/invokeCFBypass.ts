
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import debugFactory from 'debug'

const debug = debugFactory('cfbypass')

const ACCOUNT_ID = process.env.ACCOUNT_ID
const REGION = process.env.REGION

const lambda = new LambdaClient({ region: process.env.REGION })

interface InvokeResult {
  statusCode: number
  text: string
}

export default async (url: string, method = 'get', headers = {}, body: unknown = null): Promise<InvokeResult> => {
  const invokeCommand = new InvokeCommand({
    FunctionName: `arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:cloudflare-bypass-prod-proxy`,
    Payload: Buffer.from(JSON.stringify({ url, method, headers, body }))
  })

  const result = await lambda.send(invokeCommand)

  
  debug(`${method} ${url} -> ${result.StatusCode}`)

  return JSON.parse(Buffer.from(result.Payload!.buffer).toString())
}