const providersService = require('../providers')
const makeResponse = require('../utils/makeResponse')

module.exports = async (event) => {
    let result = {}

    if(event.pathParameters) {
        const { provider, resultId } = event.pathParameters
        result = await providersService.getInfo(provider, resultId)
    }

    return makeResponse(result)
}