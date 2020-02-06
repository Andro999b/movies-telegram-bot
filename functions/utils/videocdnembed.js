const superagent = require('superagent')
const cheerio = require('cheerio')
const getBestPlayerJSQuality = require('./getBestPlayerJSQuality')
const convertPlayerJSPlaylist = require('./convertPlayerJSPlaylist')

function _extractNoTranslations(playlist) {
    if (typeof playlist === 'string') {
        const urls = getBestPlayerJSQuality(playlist)

        return [{
            url: urls.pop(),
            alternativeUrls: urls
        }]
    } else {
        return convertPlayerJSPlaylist(playlist)
    }
}

function _extractTranslations(translations, playlists) {
    return Object.keys(translations)
        .map((translation) => {
            const playlist = playlists[translation]
            const translationName = translations[translation]

            if (typeof playlist === 'string') {
                const urls = getBestPlayerJSQuality(playlist)

                return [{
                    name: translationName,
                    url: urls.pop(),
                    alternativeUrls: urls
                }]
            } else {
                return convertPlayerJSPlaylist(playlist)
                    .map((file) => ({
                        ...file,
                        path: [translationName, file.path].filter((it) => it).join('/')
                    }))
            }
        })
        .reduce((acc, item) => acc.concat(item), [])
        .map((file, index) => ({ ...file, id: index }))
}

module.exports = async (url) => {
    const res = await superagent.get(url.startsWith('//') ? 'https:' + url : url)
    const $ = cheerio.load(res.text)

    const translations = $('.translations > select > option')
        .toArray()
        .reduce((acc, el) => {
            const $el = $(el)

            return Object.assign(acc, {
                [$el.attr('value')]: $el.text().replace(/[\n]/g, '').trim()
            })
        }, {})

    const files = $('#files').attr('value')
    const playlists = JSON.parse(files)

    if (Object.keys(translations).length == 0) {
        const translationId = $('#translation_id').attr('value') || '0'
        return _extractNoTranslations(playlists[translationId])
    }

    return _extractTranslations(translations, playlists)
}