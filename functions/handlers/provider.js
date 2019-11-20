const providersService = require('../providers')
const makeResponse = require('../utils/makeResponse')

module.exports = async () => makeResponse(providersService.getProviders())