const kodikExtractor = require('./kodikExtractor')

module.exports = ({ url }) => kodikExtractor({ 
    url, 
    linksApi: 'https://aniqit.com/get-video-info',
    referer: 'https://wakanim.online'
})
