import { search } from '../providers/index'
import makeResponse from '../utils/makeResponse'
import isOriginAllowed from '../utils/isOriginAllowed'
import { ProvidersNames, SearchResult } from '../types/index'
import { APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event) => {
  if (!isOriginAllowed(event))
    return makeResponse('forbiden', 403)

  let results: SearchResult[] = []

  if (event.queryStringParameters) {
    const { q } = event.queryStringParameters as { q: string }
    const { provider } = event.pathParameters as { provider: ProvidersNames }

    if (q) {
      results = await search([provider], q)
    }
  }

  return makeResponse(results, 200, {
    'Access-Control-Allow-Origin': event.headers.origin
  })
}