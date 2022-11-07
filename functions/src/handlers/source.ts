import { getCachedSource } from '../cache/caches.js'
import { getSource } from '../providers/index.js'
import makeResponse from '../utils/makeResponse.js'
import isOriginAllowed from '../utils/isOriginAllowed.js'
import { File } from '../types/index.js'
import { APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event, context) => {
  if (!isOriginAllowed(event))
    return makeResponse('forbiden', 403)

  context.callbackWaitsForEmptyEventLoop = false

  let result: File | null = null

  if (event.pathParameters) {
    const { provider, resultId, sourceId } = event.pathParameters as {
      provider: string
      resultId: string
      sourceId: string
    }

    result = await getCachedSource(
      provider, resultId, sourceId,
      () => getSource(
        provider,
        resultId,
        sourceId,
        event.queryStringParameters as Record<string, string>
      )
    )
  }

  return makeResponse(result, 200, {
    'Access-Control-Allow-Origin': event.headers.origin
  })
}