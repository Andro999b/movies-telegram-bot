import { File, Playlist, SearchResult } from '../types'
import Cache from './Cache'
import mongoDBCache from './mongoDBCache'

const caches: Record<string, Cache<string, unknown>> = {}
async function getCache<Item, C = Cache<string, Item>>(cacheName: string): Promise<C> {
  let cache = caches[cacheName]

  if (!cache) {
    cache = await mongoDBCache<Item>(cacheName)
    caches[cacheName] = cache
  }

  return cache as C
}

export default {
  getCache,
  getCachedInfo: async (
    provider: string,
    resultId: string,
    compute: () => Promise<Playlist>
  ): Promise<Playlist> => {
    const cache = await getCache<Playlist>('info')
    return cache.getOrCompute(
      `${provider}:${resultId}`,
      compute,
      (result) => !result.files || result.files.length == 0
    )
  },
  getCachedSource: async (
    provider: string,
    resultId: string,
    sourceId: string,
    compute: () => Promise<File>
  ): Promise<File> => {
    const cache = await getCache<File>('source')
    return cache.getOrCompute(
      `${provider}:${resultId}:${sourceId}`,
      compute
    )
  },
  getCachedSearch: async (
    provider: string,
    query: string,
    compute: () => Promise<SearchResult>
  ): Promise<SearchResult> => {
    const cache = await getCache<SearchResult>('search')
    return cache.getOrCompute(
      `${provider}:${query}`,
      compute
    )
  }
}