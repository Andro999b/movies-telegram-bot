import superagent from 'superagent'
import makeResponse from '../utils/makeResponse'
import { extractStringSingleQuote } from '../utils/extractScriptVariable'
import providersConfig from '../providersConfig'
import { Extractor } from '.'

const anigatoConfig = providersConfig.providers.anigato
const kodikSign = anigatoConfig['kodikSign'] as Record<string, string>

interface KodikLinks {
  [key: string]: { src: string }[]
}

function linkExtractor(links: KodikLinks, hls: boolean): string {
  const bestQuality = Object.keys(links).pop()!
  let redirectUrl = links[bestQuality][0].src
  redirectUrl = Buffer.from(redirectUrl.split('').reverse().join(''), 'base64').toString()

  if (!hls) {
    redirectUrl = redirectUrl.replace(':hls:manifest.m3u8', '')
  }

  return redirectUrl
}

const AnigitExxtractor: Extractor = async ({ url, ttype, tid, thash, season }) => {
  const linksApi = 'https://kodik.biz/gvi'
  const referer = 'https://anigato.ru/'

  let id, hash, type = 'video'

  if (tid) {
    const signParams = Object.keys(kodikSign)
      .map((key) => `${key}=${kodikSign[key]}`)
      .join('&')

    if (ttype == 'serial') {
      type = 'seria'
      url = `https://kodik.biz/serial/${tid}/${thash}/720p?${signParams}&season=${season}&episode=${url}`
    } else {
      url = `https://kodik.biz/video/${tid}/${thash}/720p?${signParams}`
    }

    const res = await superagent.get(url)
      .set({
        'User-Agent': anigatoConfig.userAgent,
        'Referer': referer,
      })
      .timeout(10000)

    id = extractStringSingleQuote(res.text, 'videoInfo\\.id')
    hash = extractStringSingleQuote(res.text, 'videoInfo\\.hash')
  } else {
    if (url.startsWith('//'))
      url = 'https:' + url;
    [, , id, hash] = new URL(url).pathname.split('/')
  }

  const videoInfoParams = {
    id,
    hash,
    type,
    bad_user: false,
    info: '{}',
    ...kodikSign
  }

  // return videoInfoParams
  const videoInfoRes = await superagent
    .post(linksApi)
    .type('form')
    .set({
      'User-Agent': anigatoConfig.userAgent,
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

export default AnigitExxtractor