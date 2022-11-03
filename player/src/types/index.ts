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
    id: string
    name: string
    path?: string
    asyncSource?: string | AsyncSource | null
    urls?: FileUrl[]
}

export interface AsyncSource {
    sourceId: string
    params: Record<string, unknown>
}

export interface FileUrl {
    url: string
    hls: boolean
    audio?: string
    quality?: number
    extractor?: Extrator
}

export interface Extrator {
    type: string
    params: Record<string, unknown>
}

export interface Source {
    urls: FileUrl[]
    currentTime?: number
}

export interface AudioTrack {
    id: string
    name: string
}