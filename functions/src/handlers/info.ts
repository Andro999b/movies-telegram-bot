import { getCachedInfo } from '../cache/index'
import { getInfo } from '../providers/index'
import makeResponse from '../utils/makeResponse'
import isOriginAllowed from '../utils/isOriginAllowed'
import { APIGatewayProxyHandler } from 'aws-lambda'
import { Playlist, ProvidersNames } from '../types/index'

export const handler: APIGatewayProxyHandler = async (event, context) => {
  if (!isOriginAllowed(event))
    return makeResponse('forbiden', 403)

  context.callbackWaitsForEmptyEventLoop = false

  let result: Playlist | null = null

  if (event.pathParameters) {
    const { provider, resultId } = event.pathParameters as {
      provider: ProvidersNames
      resultId: string
    }
    const nocache = event.queryStringParameters?.nocache

    if (nocache === 'true') {
      result = await getInfo(provider, resultId)
    } else {
      result = await getCachedInfo(
        provider, resultId,
        () => getInfo(provider, resultId)
      )
    }
  }

  return makeResponse(result, 200, {
    'Access-Control-Allow-Origin': event.headers.origin
  })
}