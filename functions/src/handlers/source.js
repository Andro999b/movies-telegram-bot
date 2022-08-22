const { getCachedSource } = require('../cache')
const providersService = require('../providers')
const makeResponse = require('../utils/makeResponse')
const isOriginAllowed = require('../utils/isOriginAllowed')

module.exports.handler = async (event, context) => {
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