
const makeResponse = require('../utils/makeResponse')

const extractors = {
    'animevost': require('./animevostExtractor'),
    'tortuga': require('./m3u8Extractor'),
    'kodik': require('./kodikExtractor'),
    'animedia': require('./m3u8Extractor'),
    'sibnethls': require('./sibnetExtractorHls'),
    'sibnetmp4': require('./sibnetExtractorMp4'),
    'stormo': require('./mp4PlayerJsExtractor'),
}

module.exports = async (parmas) => {
    if(!parmas)
        return makeResponse({ message: 'No extractor parmas'}, 404)

    const { type } = parmas
    const extractor = extractors[type]

    if(!extractor)
        return makeResponse({ message: 'No extractor found'}, 404)

    return await extractor(parmas)
}