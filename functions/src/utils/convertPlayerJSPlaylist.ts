import { File, PlayerJSItem, PlayerJSPlaylist, UrlAndQualityAndAudio } from '../types/index.js'
import getBestPlayerJSQuality from './parsePlayerJSFile.js'

export type LinksExtractor = (file: string) => UrlAndQualityAndAudio[]

export default (playlist: PlayerJSPlaylist, linksExtractor = getBestPlayerJSQuality): File[] => {
  const idsCache: Record<string, File> = {}

  function convertFolder(prefix: string | null, items: PlayerJSItem[], linksExtractor: LinksExtractor): File[] {
    let counter = 0

    return items
      .map((it, index: number): File[] => {
        if (it.file) {
          const item: File = {
            id: null,
            name: null,
            urls: linksExtractor(it.file)
          }

          if (it.id) {
            const cacheItem: File = idsCache[it.id]
            if (cacheItem) {
              if (item.urls) cacheItem.urls = item.urls.concat(cacheItem.urls ?? [])

              return [cacheItem]
            } else {
              idsCache[it.id] = item
            }
          }

          item.name = it.title || `Episode ${++counter}`

          if (prefix) {
            item.path = prefix
          }

          return [item]
        } else {
          const { title, comment, folder, playlist } = it
          const path = title || comment || `Season ${index + 1}`

          return convertFolder(
            prefix ? prefix + '/' + path.trim() : path.trim(),
            folder ?? playlist ?? [],
            linksExtractor
          )
        }
      })
      .flatMap((it) => it)
  }

  function decode0(input: string): string {
    if (input.indexOf('.') == -1) {
      input = input.substring(1)
      let s2 = ''
      for (let i = 0; i < input.length; i += 3) {
        s2 += '%u0' + input.slice(i, i + 3)
      }
      input = decodeURI(s2)
    }
    return input
  }


  if (typeof playlist === 'string') {
    if (playlist.startsWith('#0')) {
      playlist = decode0(playlist)
    }
    if (playlist.startsWith('[{')) {
      return convertFolder(null, JSON.parse(playlist), linksExtractor)
    } else {
      return [{ urls: linksExtractor(playlist), id: 0, name: null }]
    }
  } else {
    return convertFolder(null, playlist, linksExtractor)
  }
}