const superagent = require('superagent')
const makeResponse = require('../utils/makeResponse')

function defaultLinkExtractor(links, hls) {
    const bestQuality = Object.keys(links).pop()
    let redirectUrl = links[bestQuality][0].src

    if(!hls) {
        redirectUrl = redirectUrl.replace(':hls:manifest.m3u8', '')
    }

    return redirectUrl
}

module.exports = async (params) => {
    const { url, referer, hls, linksApi, hash2 = 'vbWENyTwIn8I', linkExtractor = defaultLinkExtractor } = params

    let targetUrl
    if(!url.includes('/go/')) {
        const res = await superagent
            .get(url.startsWith('//') ? 'https:' + url : url)
            .set({ 'Referer': referer || url })
            .timeout(10000)

        const matches = res.text.match(/iframe\.src = "([^"]+)"/)

        if(!matches)
            throw Error('Video can`t be extracted', params)
        
        const urlMatch = matches[1]

        targetUrl = new URL(urlMatch.startsWith('//') ? 'https:' + urlMatch : urlMatch)
    } else {
        targetUrl = new URL(url.startsWith('//') ? 'https:' + url : url)
    }

    const { id, hash, type } = targetUrl.pathname.match(/\/go\/(?<type>[a-z]+)\/(?<id>[0-9]+)\/(?<hash>[0-9a-z]+)/).groups

    const videoInfoParams =  {
        id,
        hash,
        hash2,
        d: targetUrl.searchParams.get('d'),
        d_sign: targetUrl.searchParams.get('d_sign'),
        pd: targetUrl.searchParams.get('pd'),
        pd_sign: targetUrl.searchParams.get('pd_sign'),
        ref: encodeURIComponent(targetUrl.searchParams.get('ref')),
        ref_sign: targetUrl.searchParams.get('ref_sign'),
        type: type,
        bad_user: false,
        info: "{}"
    }

    const videoInfoRes = await superagent
        .post(linksApi || 'https://kodik.info/video-links')
        .type('form')
        .set({ 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Referer': targetUrl.toString()
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
module.exports.defaultLinkExtractor = defaultLinkExtractor