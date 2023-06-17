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
  id: string
  name: string
  path?: string
  asyncSource?: string | AsyncSource | null
  urls?: FileUrl[]
  subtitle?: Subtitle[]
}

export interface Subtitle{
  language: string
  url: string
}

export interface AsyncSource {
  sourceId: string
  params: Record<string, unknown>
}

export interface FileUrl {
  url: string
  hls?: boolean
  audio?: string
  quality?: number
  extractor?: Extrator
  subtitle?: Subtitle[]
}

export interface Extrator {
  type: string
  params: Record<string, string>
}

export interface Source {
  subtitle: Subtitle[]
  urls: FileUrl[]
  currentTime?: number
}

export interface AudioTrack {
  id: string
  name: string
}
