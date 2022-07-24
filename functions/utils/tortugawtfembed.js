const superagent = require('superagent')
const cheerio = require('cheerio')
const convertPlayerJSPlaylist = require('./convertPlayerJSPlaylist')
const stripPlayerJSConfig = require('./stripPlayerJSConfig')

module.exports = async (url) => {
    let res
    try {
        res = await superagent.get(url.startsWith('//') ? 'https:' + url : url).disableTLSCerts()
    } catch (e) {
        console.error('Fail get iframe', url, e)
        return []
    }
    
    const config = stripPlayerJSConfig(res.text)

    if (config) {
        const { file } = config
        return convertPlayerJSPlaylist(file)
    }
}