const superagent = require('superagent')
const makeResponse = require('../utils/makeResponse')
const { extractStringSingleQuote } = require('../utils/extractScriptVariable')
const PROVIDERS_CONFIG = require('../providersConfig')
const ANIGATO_CONFIG = PROVIDERS_CONFIG['anigato']

function linkExtractor(links, hls) {
    const bestQuality = Object.keys(links).pop()
    let redirectUrl = links[bestQuality][0].src
    redirectUrl = Buffer.from(redirectUrl.split('').reverse().join(''), 'base64').toString()

    if (!hls) {
        redirectUrl = redirectUrl.replace(':hls:manifest.m3u8', '')
    }

    return redirectUrl
}

module.exports = async (params) => {
    let { url, ttype, tid, thash, season } = params

    const linksApi = 'https://kodik.biz/gvi'
    const referer = 'https://anigato.ru/'

    const signParams = Object.keys(ANIGATO_CONFIG.kodicSign)
        .map((key) => `${key}=${ANIGATO_CONFIG.kodicSign[key]}`)
        .join('&')

    let type = 'seria'
    let iframeUrl

    if (ttype == 'serial') {
        iframeUrl = `https://kodik.biz/serial/${tid}/${thash}/720p?${signParams}&season=${season}&episode=${url}`
    } else {
        iframeUrl = `https://kodik.biz/video/${tid}/${thash}/720p?${signParams}`
        type = 'video'
    }

    const res = await superagent.get(iframeUrl)
        .set({
            'User-Agent': PROVIDERS_CONFIG.userAgent,
            'Referer': referer,
        })
        .timeout(10000)

    const id = extractStringSingleQuote(res.text, 'videoInfo\\.id')
    const hash = extractStringSingleQuote(res.text, 'videoInfo\\.hash')

    const videoInfoParams = {
        id,
        hash,
        type,
        bad_user: false,
        info: '{}',
        ...ANIGATO_CONFIG.kodicSign
    }

    // return videoInfoParams

    const videoInfoRes = await superagent
        .post(linksApi)
        .type('form')
        .set({
            'User-Agent': PROVIDERS_CONFIG.userAgent,
            'Referer': url
        })
        .send(videoInfoParams)
        .timeout(5000)

    const videoInfo = JSON.parse(videoInfoRes.text)
    const links = videoInfo.links

    let redirectUrl = linkExtractor(links, true)

    if (redirectUrl.startsWith('//')) {
        redirectUrl = 'https:' + redirectUrl
    }

    return makeResponse(null, 302, {
        Location: redirectUrl
    })
}