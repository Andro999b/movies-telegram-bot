
const makeResponse = require('../utils/makeResponse')

const extractors = {
    'animevost': require('./animevostExtractor'),
    'kinogo': require('./kinogoExtractor'),
    'tortuga': require('./m3u8Extractor'),
    'ashdi': require('./m3u8Extractor'),
    'anigit': require('./anigitExtractor'),
    'animedia': require('./m3u8Extractor'),
    'sibnethls': require('./sibnetExtractorHls'),
    'sibnetmp4': require('./sibnetExtractorMp4'),
    'stormo': require('./mp4PlayerJsExtractor'),
    'anidub': require('./anidubExtractor'),
    'mp4': require('./mp4PlayerJsExtractor'),
    'm3u8': require('./m3u8Extractor')
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