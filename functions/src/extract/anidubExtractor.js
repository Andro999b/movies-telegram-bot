import superagent from 'superagent'
import makeResponse from '../utils/makeResponse'
import providersConfig from '../providersConfig'

const baseUrl = providersConfig.providers.anidub.baseUrl

export default async ({ url }, headers) => {
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
  let hslUrl = baseUrl + '/player/' + hslPlaylist

  const hlsRes = await superagent
    .get(hslUrl)
    .timeout(5000)
    .set(proxyHeaders)
    .disableTLSCerts()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
      'Content-Type': 'application/vnd.apple.mpegURL'
    },
    body: hlsRes.body.toString('utf8')
  }
}