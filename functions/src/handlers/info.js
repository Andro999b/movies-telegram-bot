const { getCachedInfo } = require('../cache')
const providersService = require('../providers')
const makeResponse = require('../utils/makeResponse')
const isOriginAllowed = require('../utils/isOriginAllowed')

module.exports.handler = async (event, context) => {
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