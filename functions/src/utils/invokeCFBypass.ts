import AWS from 'aws-sdk'
const { Lambda, config } = AWS
const lambda = new Lambda()

const ACCOUNT_ID = process.env.ACCOUNT_ID
const REGION = process.env.REGION || config.region

interface InvokeResult {
  statusCode: number
  text: string
}

export default (url: string, method = 'get', headers = {}, body: unknown = null): Promise<InvokeResult> => new Promise((resolve, reject) => {
  const params = {
    FunctionName: `arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:cloudflare-bypass-prod-proxy`,
    Payload: JSON.stringify({ url, method, headers, body })
  }

  lambda.invoke(params, function (err, data) {
    if (err) reject(err)
    else resolve(JSON.parse(data.Payload as string) as InvokeResult)
  })
})