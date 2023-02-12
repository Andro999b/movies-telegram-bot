import { getCachedSource } from '../cache/index'
import { getSource } from '../providers/index'
import makeResponse from '../utils/makeResponse'
import isOriginAllowed from '../utils/isOriginAllowed'
import { File, ProvidersNames } from '../types/index'
import { APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event, context) => {
  if (!isOriginAllowed(event))
    return makeResponse('forbiden', 403)

  context.callbackWaitsForEmptyEventLoop = false

  let result: Partial<File> | null = null

  if (event.pathParameters) {
    const { provider, resultId, sourceId } = event.pathParameters as {
      provider: ProvidersNames
      resultId: string
      sourceId: string
    }

    const nocache = event.queryStringParameters?.nocache

    if (nocache === 'true') {
      result = await getSource(
        provider,
        resultId,
        sourceId,
        event.queryStringParameters as Record<string, string>
      )
    } else {
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
  }

  return makeResponse(result, 200, {
    'Access-Control-Allow-Origin': event.headers.origin
  })
}