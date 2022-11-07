export interface UrlAndQuality { url: string, quality: number }
export interface UrlAndQualityAndAudio extends UrlAndQuality {
  audio?: string
}

export interface Playlist {
  id: string
  provider: string
  title: string
  image: string
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
  extractor?: Extrator
}

export interface Extrator {
  type: string
  params?: Record<string, unknown>
}