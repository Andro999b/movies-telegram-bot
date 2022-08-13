const providersService = require('../providers')
const makeResponse = require('../utils/makeResponse')

module.exports.handler = async () => makeResponse(providersService.getProviders())