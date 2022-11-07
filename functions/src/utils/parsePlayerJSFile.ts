import { UrlAndQuality, UrlAndQualityAndAudio } from '../types/index.js'

export default (input: string): UrlAndQualityAndAudio[] => {
  const seen = new Set()
  return input
    .replace(/\\/g, '')
    .split(',')
    .map((link): UrlAndQuality[] | null => {
      const res = link.trim().match(/(\[[^0-9[]*(?<quality>[0-9]+)[^0-9\]]*\])?(?<urls>.*)/)

      if (!res) return null

      const { urls, quality } = res.groups ?? {} as { urls: string, quality: string }
      const qualityNum = quality ? parseInt(quality) : 0

      return urls.split(' or ').map((url) => ({ url, quality: qualityNum }))
    })
    .filter((it) => it)
    .flatMap((it) => it!)
    .map(({ url, quality }): UrlAndQuality => {
      if (!quality) {
        const res = url.match(/.*\/(?<quality>[0-9]+)\.(?:mp4|m3u8)/)
        if (res) {
          const groups = res.groups ?? {} as { quality: string }
          quality = groups.quality ? parseInt(groups.quality) : quality
        }
      }

      return {
        url: url.startsWith('//') ? 'https:' + url : url,
        quality
      }
    })
    .flatMap(({ url, quality }) => {
      return url
        .split(';')
        .map((url): UrlAndQualityAndAudio => {
          const res = url.match(/\{(?<audio>[^}]*)\}(?<url>.*)/)

          if (!res) return {
            url,
            quality
          }

          const groups = res.groups ?? {} as { ursl: string, audio: string }

          return {
            url: groups?.url,
            audio: groups?.audio,
            quality
          }
        })
    })
    .filter((it) => {
      if (seen.has(it.url)) return false
      seen.add(it.url)
      return true
    })
    .sort((a, b) => b.quality - a.quality)
}