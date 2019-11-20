const providersService = require('../providers')
const makeResponse = require('../utils/makeResponse')

module.exports = async (event) => {
    let results = []

    if(event.queryStringParameters) {
        const { q } = event.queryStringParameters
        const { provider } = event.pathParameters

        if(q) {
            results = await providersService.search([provider], q)
        }
    }

    return makeResponse(results)
}