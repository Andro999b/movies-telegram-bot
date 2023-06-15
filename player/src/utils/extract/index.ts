import { Extrator } from '../../types'
import { base64ToArrayBuffer } from '../base64'
import m3u8localExtract from './m3u8localExtract'
import mp4localExtract from './mp4localExtract'

export interface Pattern {
  expression: RegExp
  transform: (m: Array<string>) => string
}

export type ExtractFun = (url: string) => Promise<string> | string

export function createExtractorUrlBuilder(extractor: Extrator, additionalParams?: Record<string, unknown>): ExtractFun {
  const { type, params } = extractor

  const finalParams = { ...params, ...additionalParams }

  switch (type) {
    case 'mp4local': return mp4localExtract()
    case 'm3u8local': return m3u8localExtract()
  }

  // @ts-ignore
  let extractorBaseUrl = `${window.API_BASE_URL}/extract?`
  extractorBaseUrl += `type=${type}`

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
