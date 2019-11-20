const extractors = require('../extract')

module.exports = async (event) => {
    return extractors(event.queryStringParameters)
}