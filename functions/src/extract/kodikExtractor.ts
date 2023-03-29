import superagent from 'superagent'
import makeResponse from '../utils/makeResponse'
import { extractStringSingleQuote } from '../utils/extractScriptVariable'
import providersConfig from '../providersConfig'
import { APIGatewayProxyResult } from 'aws-lambda'
import { base64decode } from '../utils/base64'

const linksApi = 'https://kodik.info/gvi'
const userAgent = providersConfig.userAgent

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

export interface KodikParams {
  url: string
  referer: string
  kodikSign: Record<string, string>
  tid?: string
  ttype?: string
  thash?: string
  season?: string
}

function decodeSrc(src: string): string {
  src = src.replace(/[a-zA-Z]/g, (e: string) => 
    String.fromCharCode((e <= 'Z' ? 90 : 122) >= (e = e.charCodeAt(0) + 13) ? e : e - 26)
  )
  return base64decode(src)
}

const kodikExtractor = async ({ url, referer, kodikSign, ttype, tid, thash, season }: KodikParams): Promise<APIGatewayProxyResult> => {
  let id, hash, type = 'video'

  if (tid) {
    const signParams = Object.keys(kodikSign)
      .map((key) => `${key}=${kodikSign[key]}`)
      .join('&')

    if (ttype == 'season') {
      type = 'seria'
      url = `https://kodik.info/season/${tid}/${thash}/720p?${signParams}&episode=${url}`
    } else if (ttype == 'serial') {
      type = 'seria'
      url = `https://kodik.info/serial/${tid}/${thash}/720p?${signParams}&season=${season}&episode=${url}`
    } else {
      url = `https://kodik.info/video/${tid}/${thash}/720p?${signParams}`
    }

    const res = await superagent.get(url)
      .set({
        'User-Agent': userAgent,
        'Referer': referer,
      })
      .timeout(10000)

    id = extractStringSingleQuote(res.text, 'videoInfo\\.id')
    hash = extractStringSingleQuote(res.text, 'videoInfo\\.hash')
  } else {
    if (url.startsWith('//')) {
      url = 'https:' + url
    }

    [, type, id, hash] = new URL(url).pathname.split('/')
  }

  const videoInfoParams = {
    id,
    hash,
    type,
    bad_user: false,
    info: '{}',
    ...kodikSign
  }

  const videoInfoRes = await superagent
    .post(linksApi)
    .type('form')
    .set({
      'User-Agent': userAgent,
      'Referer': url
    })
    .send(videoInfoParams)
    .timeout(5000)

  const videoInfo = JSON.parse(videoInfoRes.text)
  const links = videoInfo.links

  let redirectUrl = decodeSrc(linkExtractor(links, true))

  if (redirectUrl.startsWith('//')) {
    redirectUrl = 'https:' + redirectUrl
  }

  return makeResponse(null, 302, {
    Location: redirectUrl
  })
}

export default kodikExtractor