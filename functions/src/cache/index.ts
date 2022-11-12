import { File, Playlist, SearchResult } from '../types/index.js'
import Cache from './Cache.js'
import mongoDBCache from './mongoDBCache.js'

const caches: Record<string, Cache<string, unknown>> = {}
export async function getCache<Item, C = Cache<string, Item>>(cacheName: string): Promise<C> {
  let cache = caches[cacheName]

  if (!cache) {
    cache = await mongoDBCache<Item>(cacheName)
    caches[cacheName] = cache
  }

  return cache as C
}

export const getCachedInfo = async (
  provider: string,
  resultId: string,
  compute: () => Promise<Playlist | null>
): Promise<Playlist | null> => {
  const cache = await getCache<Playlist>('info')
  return cache.getOrCompute(
    `${provider}:${resultId}`,
    compute,
    (result) => !result?.files || result.files.length == 0
  )
}
export const getCachedSource = async (
  provider: string,
  resultId: string,
  sourceId: string,
  compute: () => Promise<File | null>
): Promise<File | null> => {
  const cache = await getCache<File>('source')
  return cache.getOrCompute(
    `${provider}:${resultId}:${sourceId}`,
    compute
  )
}
export const getCachedSearch = async (
  provider: string,
  query: string,
  compute: () => Promise<SearchResult | null>
): Promise<SearchResult | null> => {
  const cache = await getCache<SearchResult>('search')
  return cache.getOrCompute(
    `${provider}:${query}`,
    compute
  )
}
