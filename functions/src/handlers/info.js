const { getCachedInfo } = require('../cache')
const providersService = require('../providers')
const makeResponse = require('../utils/makeResponse')

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    let result = {}

    if (event.pathParameters) {
        const { provider, resultId } = event.pathParameters
        const { nocache } = event.queryStringParameters

        if (nocache === 'true') {
            result = providersService.getInfo(provider, resultId)
        } else {
            result = await getCachedInfo(
                provider, resultId,
                ([provider, resultId]) => providersService.getInfo(provider, resultId)
            )
        }
    }



    return makeResponse(result)
}