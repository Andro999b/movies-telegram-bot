const { getCahcedInfo } = require('../cache')
const { recordPlaylistLoad } = require('../watches')
const providersService = require('../providers')
const makeResponse = require('../utils/makeResponse')

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    let result = {}

    if (event.pathParameters) {
        const { provider, resultId, nocache } = event.pathParameters

        if (nocache) {
            result = providersService.getInfo(provider, resultId)
        } else {
            result = await getCahcedInfo(
                provider, resultId,
                ([provider, resultId]) => providersService.getInfo(provider, resultId)
            )
        }

        const dnt = event.queryStringParameters && event.queryStringParameters.dnt

        if(dnt != "1") 
            await recordPlaylistLoad(result)
    }



    return makeResponse(result)
}