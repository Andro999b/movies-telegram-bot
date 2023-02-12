import { Extractor } from '.'
import makeResponse from '../utils/makeResponse'
import providersConfig from '../providersConfig'
import superagent from 'superagent'
import { load } from 'cheerio'

const animegoConfig = providersConfig.providers.animego

interface Parameters {
  hls: string
}

interface HLSParameter {
  src: string
}

const aniboomExtractor: Extractor = async ({ url }) => {
  if (url.startsWith('//')) {
    url = 'https:' + url
  }

  const res = await superagent.get(url)
    .set('User-Agent', providersConfig.userAgent)
    .set('Referer', animegoConfig.baseUrl)

  const $ = load(res.text)
  const parameters = $('#video').data('parameters') as Parameters
  const hlsParameter = JSON.parse(parameters.hls) as HLSParameter

  return makeResponse(null, 302, {
    Location: hlsParameter.src
  })
}

export default aniboomExtractor