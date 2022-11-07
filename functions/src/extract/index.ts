
import makeResponse from '../utils/makeResponse.js'
import AnimevostExtractor from './animevostExtractor.js'
import KinogoExtractor from './kinogoExtractor.js'
import M3U8Extractor from './m3u8Extractor.js'
import AnigitExtractor from './anigitExtractor.js'
import SibnetHlsExtractor from './sibnetHlsExtractor.js'
import SibnetMp4Extractor from './sibnetMp4Extractor.js'
import MP4PlayerJsExtractor from './mp4PlayerJsExtractor.js'
import AnidubExtractor from './anidubExtractor.js'
import { APIGatewayProxyResult } from 'aws-lambda'

export interface ExtractorParams {
  type: string
  url: string
  [key: string]: string
}
export type Extractor = (params: ExtractorParams, headers: Record<string, string>) => Promise<APIGatewayProxyResult>

const extractors: Record<string, Extractor> = {
  'animevost': AnimevostExtractor,
  'kinogo': KinogoExtractor,
  'tortuga': M3U8Extractor,
  'ashdi': M3U8Extractor,
  'anigit': AnigitExtractor,
  'animedia': M3U8Extractor,
  'sibnethls': SibnetHlsExtractor,
  'sibnetmp4': SibnetMp4Extractor,
  'stormo': MP4PlayerJsExtractor,
  'anidub': AnidubExtractor,
  'mp4': MP4PlayerJsExtractor,
  'm3u8': M3U8Extractor
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