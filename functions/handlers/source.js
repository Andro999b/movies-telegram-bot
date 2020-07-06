const getCache = require('../cache')
const providersService = require('../providers')
const makeResponse = require('../utils/makeResponse')


module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    let result = {}
    
    if (event.pathParameters) {
        const { provider, resultId, sourceId } = event.pathParameters

        const cache = await getCache()

        result = await cache.getCahcedSource(
            provider, resultId, sourceId, 
            ([provider, resultId, sourceId]) => providersService.getSource(provider, resultId, sourceId)
        )
    }

    return makeResponse(result)
}