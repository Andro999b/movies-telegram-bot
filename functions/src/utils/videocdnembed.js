import superagent from 'superagent'
import cheerio from 'cheerio'
import convertPlayerJSPlaylist from './convertPlayerJSPlaylist'

function _extractNoTranslations(playlist) {
    return convertPlayerJSPlaylist(playlist)
}

function _extractTranslations(translations, playlists) {
    const getKey = ({ name, path }) => [path, name].filter((it) => it).join('/')
    const filesByKey = {}

    Object.keys(translations)
        .map((translation) => {
            const playlist = playlists[translation]
            const translationName = translations[translation]
            convertPlayerJSPlaylist(playlist)
                .forEach((file) => {
                    const key = getKey(file)
                    if (filesByKey[key]) {
                        const currentFile = filesByKey[key]
                        const newUrls = currentFile.urls.concat(
                            file.urls.map((u) => ({...u, audio: translationName}))
                        )
                        filesByKey[key] = { ...currentFile, urls: newUrls }
                    } else {
                        const newUrls = file.urls.map((u) => ({...u, audio: translationName}))
                        filesByKey[key] = { ...file, urls: newUrls }
                    }
                })
        })

    return Object
        .values(filesByKey)
        .map((file, id) => ({...file, id}) )
}

export default async (url, timeout = 20) => {
    let res

    res = await superagent
        .get(url.startsWith('//') ? 'https:' + url : url)
        .timeout(timeout * 1000)

    const $ = cheerio.load(res.text)

    const headerScript = $('head > script').first().get()[0].children[0].data
    const userKey = headerScript.substring(15, 47)
    
    const translations = $('.translations > select > option')
        .toArray()
        .reduce((acc, el) => {
            const $el = $(el)

            return Object.assign(acc, {
                [$el.attr('value')]: $el.text().replace(/[\n]/g, '').trim()
            })
        }, {})

    const playlistString = $('#files').attr('value')
    const playlists = JSON.parse(playlistString.replace(new RegExp(userKey, 'g'), '.mp4'))

    if (Object.keys(translations).length == 0) {
        const translationId = $('#translation_id').attr('value') || '0'
        return _extractNoTranslations(playlists[translationId])
    }

    return _extractTranslations(translations, playlists)
}