export interface ProviderConfig {
  baseUrl: string
  searchUrl: string
  imagesUrl?: string
  userAgent?: string
  cfbypass?: boolean
  timeout?: number,
  infoTimeout?: number,
  pageSize?: number,
  useProxy?: boolean,
  headers?: Record<string, string>
  [key: string]: unknown
}

export type ProvidersNames =
  'animedia' | // TODO: remove
  'animego' | 
  'anigato' | // TODO: remove
  'anitubeua' |
  'animevost' | // TODO: remove
  'kinogo' |
  'videocdn' |
  'eneyida' |
  'uafilmtv' |
  'uaserials' |
  'uakinoclub' |
  'kinovod' |
  'gidonline' |
  'rezka'

export interface ProvidersConfig {
  userAgent: string
  timeout: number,
  infoTimeout: number,
  pageSize: number,
  providers: Record<ProvidersNames, ProviderConfig>
}