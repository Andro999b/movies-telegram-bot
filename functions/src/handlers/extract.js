const makeResponse = require('../utils/makeResponse')
const isOriginAllowed = require('../utils/isOriginAllowed')
const extractors = require('../extract')

module.exports.handler = async (event) => {
    if (!isOriginAllowed(event))
        return makeResponse('forbiden', 403)

    const response = await extractors(event.queryStringParameters, event.headers)
    
    response.headers['Access-Control-Allow-Origin'] = event.headers.origin

    return response
}