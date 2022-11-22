import superagent from 'superagent'
import { load } from 'cheerio'
import { ProcessingInstruction } from 'domhandler'
import convertPlayerJSPlaylist from './convertPlayerJSPlaylist'
import { File, PlayerJSPlaylist } from '../types/index'

function _extractTranslations(
  translations: Record<string, string>,
  playlists: Record<string, PlayerJSPlaylist>
): File[] {
  const getKey = ({ name, path }: File): string => [path, name].filter((it) => it).join('/')
  const filesByKey: Record<string, File> = {}

  Object.keys(translations)
    .map((translation) => {
      const playlist = playlists[translation]
      const translationName = translations[translation]
      convertPlayerJSPlaylist(playlist)
        .forEach((file) => {
          const key = getKey(file)
          const currentFile = filesByKey[key]
          if (currentFile) {
            const newUrls = currentFile.urls!.concat(
              file.urls!.map((u) => ({ ...u, audio: translationName }))
            )
            filesByKey[key] = { ...currentFile, urls: newUrls }
          } else {
            const newUrls = file.urls!.map((u) => ({ ...u, audio: translationName }))
            filesByKey[key] = { ...file, urls: newUrls }
          }
        })
    })

  return Object
    .values(filesByKey)
    .map((file, id) => ({ ...file, id }))
}

export default async (url: string, timeout = 20): Promise<File[]> => {
  const res = await superagent
    .get(url.startsWith('//') ? 'https:' + url : url)
    .timeout(timeout * 1000)

  const $ = load(res.text)

  const headerScriptNode = $('head > script').first().get()[0].children[0] as ProcessingInstruction
  const headerScript = headerScriptNode.data
  const userKey = headerScript.substring(15, 47)

  const translations: Record<string, string> = $('.translations > select > option')
    .toArray()
    .reduce((acc, el) => {
      const $el = $(el)
      const key = $el.attr('value')

      if (key) {
        return Object.assign(acc, {
          [key]: $el.text().replace(/[\n]/g, '').trim()
        })
      } else {
        return acc
      }
    }, {})

  const playlistString = $('#files').attr('value')
  if (!playlistString) {
    return []
  }

  const playlists: Record<string, PlayerJSPlaylist> = JSON.parse(playlistString.replace(new RegExp(userKey, 'g'), '.mp4'))

  if (Object.keys(translations).length == 0) {
    const translationId = $('#translation_id').attr('value') || '0'
    return convertPlayerJSPlaylist(playlists[translationId])
  }

  return _extractTranslations(translations, playlists)
}