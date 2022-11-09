import { APIGatewayProxyHandler } from 'aws-lambda'
import extractors from '../extract/index.js'
import { ExtractorTypes } from '../types/playlist.js'

export const handler: APIGatewayProxyHandler = async (event) => {
  const response = await extractors(
    event.queryStringParameters as { type: ExtractorTypes, url: string },
    event.headers as Record<string, string>
  )

  if (!response.headers) response.headers = {}

  response.headers['Access-Control-Allow-Origin'] = '*'

  return response
}