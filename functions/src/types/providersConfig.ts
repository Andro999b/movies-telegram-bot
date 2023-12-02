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
  'animego' | 
  'anitubeua' |
  'animelib' |
  'animeuaclub' |
  'animevost' | 
  'videocdn' |
  'eneyida' |
  'uafilmtv' |
  'uaserials' |
  'uakinoclub' |
  'rezka'

export interface ProvidersConfig {
  userAgent: string
  timeout: number,
  infoTimeout: number,
  pageSize: number,
  providers: Record<ProvidersNames, ProviderConfig>
}