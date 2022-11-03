import { Extrator } from '../types'
import { base64ToArrayBuffer } from './base64'

interface Pattern {
  expression: RegExp
  transform: (m: Array<string>) => string
}

type ExtractFun = (url: string) => Promise<string> | string

const regexExtractor = (patterns: Array<Pattern | RegExp | string>): ExtractFun =>
  async (url: string): Promise<string> => {
    const targetUrl = url.startsWith('//') ? 'https:' + url : url

    const res = await fetch(`https://corsproxy.movies-player.workers.dev/?${targetUrl}`)
    const content = await res.text()

    for (const pattern of patterns) {
      let expression
      let transform = (m: Array<string>): string => m[m.length - 1]

      if (pattern instanceof RegExp) {
        expression = pattern
      } else if (typeof pattern === 'string') {
        expression = new RegExp(pattern)
      } else {
        expression = pattern.expression
        transform = pattern.transform
      }

      const matches = content.match(expression)

      if (matches == null || matches.length < 1)
        continue

      return await transform(matches)
    }

    throw Error('Cant extract media from url')
  }

const mp4localExtract = (): ExtractFun => regexExtractor([
  /\[1080p\](https?[^,]+\.mp4(?!\.))/,
  /\[720p\](https?[^,]+\.mp4(?!\.))/,
  /\[480p\](https?[^,]+\.mp4(?!\.))/,
  /\[360p\](https?[^,]+\.mp4(?!\.))/,
  /\[240p\](https?[^,]+\.mp4(?!\.))/,
  /(https?[^,]+_1080p\.mp4(?!\.))/,
  /(https?[^,]+_720p\.mp4(?!\.))/,
  /(https?[^,]+_480p\.mp4(?!\.))/,
  /(https?[^,]+_360p\.mp4(?!\.))/,
  /(https?[^,]+_240p\.mp4(?!\.))/
])

const mp3u8localExtract = (): ExtractFun => regexExtractor([
  /(https?.+\.m3u8)/,
])


export function createExtractorUrlBuilder(extractor: Extrator, additionalParams?: Record<string, unknown>): ExtractFun {
  const { type, params } = extractor

  switch (type) {
    case 'mp4local': return mp4localExtract()
    case 'mp3u8local': return mp3u8localExtract()
  }

  // @ts-ignore
  let extractorBaseUrl = `${window.API_BASE_URL}/extract?`
  extractorBaseUrl += `type=${type}`

  const finalParams = { ...params, ...additionalParams }

  Object.keys(finalParams).forEach((key) =>
    extractorBaseUrl += `&${key}=${finalParams[key]}`
  )

  return (url: string): string => {
    return `${extractorBaseUrl}&url=${encodeURIComponent(url)}`
  }
}

const ANIDUB_ENCRYPT_KEY = 'oWQ/ADS/n+4fhEuZmFy6WQ=='
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleSpecialHLSUrls = (context: { url: string }, callbacks: any): boolean => {
  const { url } = context

  if (
    url.startsWith('https://rusanime.ru/player/out.php') ||
    url.startsWith('https://love.statics.life/player/out.php')
  ) {
    callbacks.onSuccess({
      url: context.url,
      data: base64ToArrayBuffer(ANIDUB_ENCRYPT_KEY)
    }, null, context)

    return true
  }

  return false
}