import { APIGatewayProxyHandler } from 'aws-lambda'
import extractors from '../extract/index.js'

export const handler: APIGatewayProxyHandler = async (event) => {
  const response = await extractors(
    event.queryStringParameters as { type: string, url: string },
    event.headers as Record<string, string>
  )

  if (!response.headers) response.headers = {}

  response.headers['Access-Control-Allow-Origin'] = '*'

  return response
}