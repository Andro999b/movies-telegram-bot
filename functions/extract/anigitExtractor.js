const kodikExtractor = require('./kodikExtractor')

module.exports = ({ url }) => kodikExtractor({ url, linksApi: 'https://aniqit.com/get-vid' })
