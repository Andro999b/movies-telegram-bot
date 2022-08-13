const extractors = require('../extract')

module.exports.handler = async (event) => {
    return extractors(event.queryStringParameters, event.headers)
}