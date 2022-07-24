const superagent = require('superagent')
const makeResponse = require('../utils/makeResponse')
const { extractStringSingleQuote } = require('../utils/extractScriptVariable')

function linkExtractor(links, hls) {
    const bestQuality = Object.keys(links).pop()
    let redirectUrl = links[bestQuality][0].src
    redirectUrl = Buffer.from(redirectUrl.split('').reverse().join(''), 'base64').toString()

    if(!hls) {
        redirectUrl = redirectUrl.replace(':hls:manifest.m3u8', '')
    }

    return redirectUrl
}

module.exports = async (params) => {
    let { url, id, hash, hls } = params

    const linksApi = 'https://aniqit.com/gvi'
    const referer = 'https://anigato.ru/'

    const res = await superagent
            .get(url.startsWith('//') ? 'https:' + url : url)
            .set({ 'Referer': referer || url })
            .timeout(10000)

    const type = id == undefined ? 'video' : 'seaia'

    id = id || extractStringSingleQuote(res.text, 'videoInfo\\.id')
    hash = hash || extractStringSingleQuote(res.text, 'videoInfo\\.hash')
    const urlParamStr = extractStringSingleQuote(res.text, 'urlParams')
    const urlParam = JSON.parse(urlParamStr);

    const videoInfoParams =  {
        id,
        hash,
        type,
        bad_user: false,
        info: '{}',
        ...urlParam,
        ref: decodeURIComponent(urlParam.ref)
    }

    // return videoInfoParams

    const videoInfoRes = await superagent
        .post(linksApi)
        .type('form')
        .set({ 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Referer': url
        })
        .send(videoInfoParams)
        .timeout(5000)

    const videoInfo = JSON.parse(videoInfoRes.text)
    const links = videoInfo.links

    let redirectUrl = linkExtractor(links, hls)

    if(redirectUrl.startsWith('//')) {
        redirectUrl = 'https:' + redirectUrl
    }

    return makeResponse(null, 302, {
        Location: redirectUrl
    })
}