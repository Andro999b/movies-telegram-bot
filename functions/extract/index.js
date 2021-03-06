
const makeResponse = require('../utils/makeResponse')

const extractors = {
    'animevost': require('./animevostExtractor'),
    'tortuga': require('./m3u8Extractor'),
    'kodik': require('./kodikExtractor'),
    'anigit': require('./anigitExtractor'),
    'animedia': require('./m3u8Extractor'),
    'sibnethls': require('./sibnetExtractorHls'),
    'sibnetmp4': require('./sibnetExtractorMp4'),
    'stormo': require('./mp4PlayerJsExtractor'),
    'anidub': require('./anidubExtractor'),
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