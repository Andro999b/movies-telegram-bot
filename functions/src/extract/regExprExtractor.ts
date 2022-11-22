import superagent from 'superagent'
import { Extractor } from './index'
import makeResponse from '../utils/makeResponse'

export type MatchTransformer = (match: RegExpMatchArray) => Promise<string>
export type Pattern = RegExp | string | {
  expression: RegExp
  transform: MatchTransformer
}

export default (patterns: Pattern[]): Extractor => async (params) => {
  const { url } = params
  const targetUrl = url.startsWith('//') ? 'https:' + url : url

  const siteRes = await superagent
    .get(targetUrl)
    .timeout(5000)
    .disableTLSCerts()

  for (const pattern of patterns) {
    let expression
    let transform: MatchTransformer = (m) => Promise.resolve(m[m.length - 1])

    if (pattern instanceof RegExp) {
      expression = pattern
    } else if (typeof pattern === 'string') {
      expression = new RegExp(pattern)
    } else {
      expression = pattern.expression
      transform = pattern.transform
    }

    const matches = siteRes.text.match(expression)

    if (matches == null || matches.length < 1)
      continue

    return makeResponse(null, 302, {
      Location: await transform(matches)
    })
  }

  console.error('Video can`t be extracted', params)

  return makeResponse({ message: 'Video can`t be extracted' }, 404)
}