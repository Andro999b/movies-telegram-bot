const providersService = require('../providers')
const makeResponse = require('../utils/makeResponse')

module.exports = async (event) => {
    let results = []

    if(event.queryStringParameters) {
        let { q, providers } = event.queryStringParameters

        if(q) {
            if(!providers) {
                providers = providersService.getProviders()
            } else {
                providers = providers.split(',')
            }
        
            results = await providersService.search(providers, q)
        }
    }

    return makeResponse(results)
}