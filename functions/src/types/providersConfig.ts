export interface ProviderConfig {
  baseUrl: string
  searchUrl?: string
  imagesUrl?: string
  userAgent?: string
  cfbypass?: boolean
  timeout?: number,
  infoTimeout?: number,
  pageSize?: number,
  headers?: Record<string, string>
  [key: string]: unknown
}

export type ProvidersNames =
  'anidub' |
  'animedia' |
  'anigato' |
  'anitubeua' |
  'animevost' |
  'kinogo' |
  'videocdn' |
  'eneyida' |
  'uafilmtv' |
  'uaserials' |
  'seasonvar' |
  'kinovod'

export interface ProvidersConfig {
  userAgent: string
  timeout: number,
  infoTimeout: number,
  pageSize: number,
  providers: Record<ProvidersNames, ProviderConfig>
}