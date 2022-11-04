
import makeResponse from '../utils/makeResponse';
import './animevostExtractor';
import './kinogoExtractor';
import './m3u8Extractor';
import './m3u8Extractor';
import './anigitExtractor';
import './m3u8Extractor';
import './sibnetExtractorHls';
import './sibnetExtractorMp4';
import './mp4PlayerJsExtractor';
import './anidubExtractor';
import './mp4PlayerJsExtractor';
import './m3u8Extractor';

const extractors = {
    'animevost',
    'kinogo',
    'tortuga',
    'ashdi',
    'anigit',
    'animedia',
    'sibnethls',
    'sibnetmp4',
    'stormo',
    'anidub',
    'mp4',
    'm3u8'
}

module.exports = async (parmas, headers) => {
    if(!parmas)
        return makeResponse({ message: 'No extractor parmas'}, 404)

    const { type } = parmas
    const extractor = extractors[type]

    if(!extractor)
        return makeResponse({ message: 'No extractor found'}, 404)

    return await extractor(parmas, headers)
}