const kodikExtractor = require('./kodikExtractor')

module.exports = ({ url }) => kodikExtractor({ 
    url, 
    linksApi: 'https://aniqit.com/gvi',
    referer: 'https://wakanim.online',
    hash2: 'vbWENyTwIn8I',
    linkExtractor: (links, hls) => {
        const bestQuality = Object.keys(links).pop()
        let redirectUrl = links[bestQuality][0].src
        redirectUrl = Buffer.from(redirectUrl.split('').reverse().join(''), 'base64').toString()

        if(!hls) {
            redirectUrl = redirectUrl.replace(':hls:manifest.m3u8', '')
        }

        return redirectUrl
    }
})
