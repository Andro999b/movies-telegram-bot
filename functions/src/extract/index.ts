
import makeResponse from '../utils/makeResponse'
import animevostExtractor from './animevostExtractor'
import kinogoExtractor from './kinogoExtractor'
import m3u8Extractor, { m3u8proxy } from './m3u8Extractor'
import anigitExtractor from './anigitExtractor'
import sibnetHlsExtractor from './sibnetHlsExtractor'
import sibnetMp4Extractor from './sibnetMp4Extractor'
import mp4PExtractor, { mp4proxy } from './mp4Extractor'
import { APIGatewayProxyResult } from 'aws-lambda'
import { ExtractorTypes } from '../types/index'
import animegoKodikExtractor from './animegoKodik'
import aniboomExtractor from './aniboomExtractor'

export interface ExtractorParams {
  type: ExtractorTypes
  url: string
  [key: string]: string
}
export type Extractor = (params: ExtractorParams, headers: Record<string, string>) => Promise<APIGatewayProxyResult>

const extractors: Record<ExtractorTypes, Extractor> = {
  animevost: animevostExtractor,
  kinogo: kinogoExtractor,
  tortuga: m3u8proxy,
  ashdi: m3u8Extractor,
  anigit: anigitExtractor,
  animedia: m3u8Extractor,
  animego_kodik: animegoKodikExtractor,
  aniboom: aniboomExtractor,
  sibnethls: sibnetHlsExtractor,
  sibnetmp4: sibnetMp4Extractor,
  stormo: mp4PExtractor,
  mp4: mp4PExtractor,
  m3u8: m3u8Extractor,
  mp4local: mp4PExtractor,
  m3u8local: m3u8Extractor,
  mp4proxy: mp4proxy,
  m3u8proxy: m3u8proxy
}
export default async (parmas: ExtractorParams, headers: Record<string, string>): Promise<APIGatewayProxyResult> => {
  if (!parmas)
    return makeResponse({ message: 'No extractor parmas' }, 404)

  const { type } = parmas
  const extractor = extractors[type]

  if (!extractor)
    return makeResponse({ message: 'No extractor found' }, 404)

  return await extractor(parmas, headers)
}