const superagent = require('superagent')
const getBestPlayerJSQuality= require('../utils/getBestPlayerJSQuality')
const makeResponse = require('../utils/makeResponse')

module.exports = async (params) => {
    const { url } = params

    const siteRes = await superagent.get(url).timeout(5000)
    const matches = siteRes.text.match(/file:"(.*)",/m)

    if(matches == null || matches.length < 1)
        throw Error('Video can`t be extracted')

    const videoUrl = getBestPlayerJSQuality(matches[1])

    return makeResponse(null, 302, {
        Location: videoUrl
    })
}