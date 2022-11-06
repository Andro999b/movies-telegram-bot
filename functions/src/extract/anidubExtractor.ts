import superagent from 'superagent'
import makeResponse from '../utils/makeResponse.js'
import providersConfig from '../providersConfig.js'
import { Extractor } from './index.js'

const baseUrl = providersConfig.providers.anidub.baseUrl

const AnidubExtractor: Extractor = async ({ url }, headers) => {
  const proxyHeaders = {
    referer: baseUrl,
    'User-Agent': headers['User-Agent']
  }

  const res = await superagent
    .get(`${baseUrl}${url}`)
    .timeout(5000)
    .set(proxyHeaders)
    .disableTLSCerts()

  const matches = res.text.match(/'(video\.php\?vid=[^']+)+'/)

  if (matches == null || matches.length < 1)
    return makeResponse({ message: 'Video can`t be extracted' }, 404)


  const hslPlaylist = matches[1]
  const hslUrl = baseUrl + '/player/' + hslPlaylist

  const hlsRes = await superagent
    .get(hslUrl)
    .timeout(5000)
    .set(proxyHeaders)
    .disableTLSCerts()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': 'application/vnd.apple.mpegURL'
    },
    body: hlsRes.body.toString('utf8')
  }
}

export default AnidubExtractor