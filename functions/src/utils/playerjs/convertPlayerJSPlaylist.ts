import { File, PlayerJSItem, PlayerJSPlaylist, Subtitle, UrlAndQualityAndAudio } from '../types/index'
import decodeV0PlayerJSPlaylist from './decodeV0PlayerJSPlaylist'
import getBestPlayerJSQuality from './parsePlayerJSFile'

export type LinksExtractor = (file: string) => UrlAndQualityAndAudio[]

const SUBTITLE_REGEXP = /\[(.+)\](.+)/

export const parseSubTitleString = (subtitle: string): Subtitle[] => {
  //@ts-ignore
  return subtitle
    .split(',')
    .map((s) => {
      const res = s.match(SUBTITLE_REGEXP)

      if(!res) {
        return null
      }

      const [, language, url] = res

      return {
        language,
        url
      }
    })
    .filter((it) => it)
}

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

          if(it.subtitle) {
            item.subtitle = parseSubTitleString(it.subtitle)
          }

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


  if (typeof playlist === 'string') {
    if (playlist.startsWith('#0')) {
      playlist = decodeV0PlayerJSPlaylist(playlist)
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