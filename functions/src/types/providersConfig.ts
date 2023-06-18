import { BypassMode } from '.'

export interface ProviderConfig {
  baseUrl: string
  searchUrl: string
  imagesUrl?: string
  userAgent?: string
  timeout?: number
  bypassMode?: BypassMode
  infoTimeout?: number
  pageSize?: number
  headers?: Record<string, string>
  [key: string]: unknown
}

export type ProvidersNames =
  'animedia' | // TODO: remove
  'animego' | 
  'anigato' | // TODO: remove
  'anitubeua' |
  'animelib' |
  'animeuaclub' |
  'animevost' | // TODO: remove
  'kinogo' |
  'videocdn' |
  'eneyida' |
  'uafilmtv' |
  'uaserials' |
  'uakinoclub' |
  'gidonline' |
  'rezka'

export interface ProvidersConfig {
  userAgent: string
  timeout: number,
  infoTimeout: number,
  pageSize: number,
  providers: Record<ProvidersNames, ProviderConfig>
}