export interface UrlAndQuality { url: string, quality: number }
export interface UrlAndQualityAndAudio extends UrlAndQuality {
  audio?: string
}

export interface Playlist {
  id: string
  provider: string
  title: string
  image: string
  defaultAudio?: string
  trailer?: string
  query?: string
  files: File[]
  errorDetail?: string
}

export interface File {
  id: string | number | null
  name: string | null
  path?: string
  asyncSource?: string | AsyncSource | null
  urls?: FileUrl[]
}

export interface AsyncSource {
  sourceId: string
  params: Record<string, unknown>
}

export interface FileUrl {
  url: string,
  quality?: number
  audio?: string
  hls?: boolean
  extractor?: Extractor
}

export interface Extractor {
  type: ExtractorTypes
  params?: Record<string, unknown>
}

export type ExtractorTypes =
  'animevost' |
  'kinogo' |
  'tortuga' |
  'ashdi' |
  'anigit' |
  'animedia' |
  'sibnethls' |
  'sibnetmp4' |
  'stormo' |
  'anidub' |
  'mp4' |
  'm3u8' |
  'mp4local' |
  'm3u8local'