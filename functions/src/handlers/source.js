import { getCachedSource } from '../cache'
import providersService from '../providers'
import makeResponse from '../utils/makeResponse'
import isOriginAllowed from '../utils/isOriginAllowed'

export const handler = async (event, context) => {
    if (!isOriginAllowed(event))
        return makeResponse('forbiden', 403)

    context.callbackWaitsForEmptyEventLoop = false

    let result = {}
    
    if (event.pathParameters) {
        const { provider, resultId, sourceId } = event.pathParameters

        result = await getCachedSource(
            provider, resultId, sourceId, 
            ([provider, resultId, sourceId]) => providersService.getSource(
                provider, 
                resultId, 
                sourceId,
                event.queryStringParameters
            )
        )
    }

    return makeResponse(result, 200, {
        'Access-Control-Allow-Origin': event.headers.origin
    })
}