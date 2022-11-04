import { getCachedInfo } from '../cache'
import providersService from '../providers'
import makeResponse from '../utils/makeResponse'
import isOriginAllowed from '../utils/isOriginAllowed'

export const handler = async (event, context) => {
    if (!isOriginAllowed(event))
        return makeResponse('forbiden', 403)

    context.callbackWaitsForEmptyEventLoop = false

    let result = {}

    if (event.pathParameters) {
        const { provider, resultId } = event.pathParameters
        const nocache = event.queryStringParameters?.nocache

        if (nocache === 'true') {
            result = await providersService.getInfo(provider, resultId)
        } else {
            result = await getCachedInfo(
                provider, resultId,
                ([provider, resultId]) => providersService.getInfo(provider, resultId)
            )
        }
    }



    return makeResponse(result, 200, {
        'Access-Control-Allow-Origin': event.headers.origin
    })
}