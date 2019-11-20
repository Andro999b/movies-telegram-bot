const providersService = require('../providers')
const makeResponse = require('../utils/makeResponse')

module.exports = async (event) => {
    let result = {}

    if(event.queryStringParameters) {
        let { provider, id } = event.queryStringParameters
        result = await providersService.getInfo(provider, id)
    }

    return makeResponse(result)
}