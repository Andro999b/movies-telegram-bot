
import makeResponse from '../utils/makeResponse'
import { APIGatewayProxyResult } from 'aws-lambda'
import { ExtractorTypes } from '../types/index'
import animevostExtractor from './animevostExtractor'
import sibnetHlsExtractor from './sibnetHlsExtractor'
import sibnetMp4Extractor from './sibnetMp4Extractor'
import animegoKodikExtractor from './animegoKodik'
import animelibKodikExtractor from './animelibKodik'
import webmExtractor from './webmExtractor'
import mp4uploadExtractor from './mp4uploadExtractor'
import mp4PExtractor, { mp4proxy } from './mp4Extractor'
import m3u8Extractor, { m3u8proxy } from './m3u8Extractor'

export interface ExtractorParams {
  type: ExtractorTypes
  url: string
  [key: string]: string
}
export type Extractor = (params: ExtractorParams, headers: Record<string, string>) => Promise<APIGatewayProxyResult>

const extractors: Partial<Record<ExtractorTypes, Extractor>> = {
  animevost: animevostExtractor,
  tortuga: m3u8proxy,
  ashdi: m3u8Extractor,
  animedia: m3u8Extractor,
  animego_kodik: animegoKodikExtractor,
  animelib_kodik: animelibKodikExtractor,
  sibnethls: sibnetHlsExtractor,
  sibnetmp4: sibnetMp4Extractor,
  stormo: mp4PExtractor,
  mp4: mp4PExtractor,
  m3u8: m3u8Extractor,
  mp4proxy: mp4proxy,
  m3u8proxy: m3u8proxy,
  webm: webmExtractor,
  mp4upload: mp4uploadExtractor
}
export default async (parmas: ExtractorParams, headers: Record<string, string>): Promise<APIGatewayProxyResult> => {
  if (!parmas)
    return makeResponse({ message: 'No extractor parmas' }, 404)

  const { type } = parmas
  const extractor = extractors[type]

  if (!extractor)
    return makeResponse({ message: 'No extractor found' }, 404)

  try {
    return await extractor(parmas, headers)
  } catch (error) {
    console.error(`Extractor ${type} fail`, { parmas, error })
    return makeResponse({ message: 'fail to extract data' }, 500)
  }
}