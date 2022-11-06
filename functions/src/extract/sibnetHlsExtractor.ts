import superagent from 'superagent'
import { Extractor } from '.'

const SibnetHlsExtractor: Extractor = async (params) => {
  const { url } = params

  let res = await superagent
    .get(url.startsWith('//') ? 'https:' + url : url)
    .timeout(5000)

  const matches = res.text.match(/\/[0-9A_Za-z/]+\.m3u8/)

  if (!matches)
    throw Error('Video can`t be extracted')

  const manifestUrl = `https://video.sibnet.ru${matches[0]}`

  res = await superagent.get(manifestUrl)
    .set({ 'Referer': 'https://video.sibnet.ru' })
    .parse(superagent.parse.text)
    .timeout(5000)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': 'application/json'
    },
    body: res.text.replace(/https:\/\/dv/g, 'https://corsproxy.movies-player.workers.dev/?https://dv')
  }
}

export default SibnetHlsExtractor