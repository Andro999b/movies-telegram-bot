
const makeResponse = require('../utils/makeResponse')

const extractors = {
    'animevost': require('./animevostExtractor'),
    'ashdi': require('./m3u8Extractor'),
    '123moviesapp': require('./movies123AppExtractor'),
    'tortuga': require('./m3u8Extractor'),
    'sst': require('./mp4PlayerJsExtractor'),
    'uploadvideo': require('./mp4PlayerJsExtractor')
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