
import makeResponse from '../utils/makeResponse'
import animevostExtractor from './animevostExtractor'
import kinogoExtractor from './kinogoExtractor'
import m3u8Extractor from './m3u8Extractor'
import anigitExtractor from './anigitExtractor'
import sibnetExtractorHls from './sibnetExtractorHls'
import sibnetExtractorMp4 from './sibnetExtractorMp4'
import mp4PlayerJsExtractor from './mp4PlayerJsExtractor'
import anidubExtractor from './anidubExtractor'

const extractors = {
  'animevost': animevostExtractor,
  'kinogo': kinogoExtractor,
  'tortuga': m3u8Extractor,
  'ashdi',
  'anigit': anigitExtractor,
  'animedia',
  'sibnethls': sibnetExtractorHls,
  'sibnetmp4': sibnetExtractorMp4,
  'stormo',
  'anidub': anidubExtractor,
  'mp4': mp4PlayerJsExtractor,
  'm3u8': m3u8Extractor
}

module.exports = async (parmas, headers) => {
  if (!parmas)
    return makeResponse({ message: 'No extractor parmas' }, 404)

  const { type } = parmas
  const extractor = extractors[type]

  if (!extractor)
    return makeResponse({ message: 'No extractor found' }, 404)

  return await extractor(parmas, headers)
}