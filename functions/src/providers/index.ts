import SeasonvarProvider from './SeasonvarProvider.js'
import KinogoProvider from './KinogoProvider.js'
import KinovodProvider from './KinovodProvider.js'
import AnimeVostProvider from './AnimeVostProvider.js'
import AnimediaProvider from './AnimediaProvider.js'
import AnidubProvider from './AnidubProvider.js'
import AnigatoProvider from './AnigatoProvider.js'
import VideoCDNProvider from './VideoCDNProvider.js'
import AnitubeUAProvider from './AnitubeUAProvider.js'
import EneyidaProvider from './EneyidaProvider.js'
import UAFilmTVProvider from './UAFilmTVProvider.js'
import UASerialsProvider from './UASerialsProvider.js'
import Provider from './Provider.js'
import { File, Playlist, SearchResult } from '../types/index.js'

const providers: Provider[] = [
  new SeasonvarProvider(),
  new KinogoProvider(),
  new KinovodProvider(),
  new AnimeVostProvider(),
  new AnimediaProvider(),
  new AnidubProvider(),
  new AnigatoProvider(),
  new VideoCDNProvider(),
  new AnitubeUAProvider(),
  new EneyidaProvider(),
  new UAFilmTVProvider(),
  new UASerialsProvider(),
]


export const getProviders = (): string[] => {
  return providers.map((provider) => provider.getName())
}

export const getProvider = (name: string): Provider | undefined => {
  return providers.find((provider) => provider.getName() == name)
}

export const search = async (providers: string[], query: string): Promise<SearchResult[]> => {
  if (!query || !providers || !providers.length) {
    return []
  }

  const results = await Promise.all(providers.map(async (providerName) => {
    try {
      const provider = getProvider(providerName)
      return await provider?.search(query) ?? []
    } catch (e) {
      console.error(`Provider ${providerName} failed.`, e)
      return []
    }
  }))

  return results.reduce((acc, result) => acc.concat(result), [])
}

export const searchOne = async (providerName: string, query: string): Promise<SearchResult[]> => {
  if (!query) {
    return []
  }

  try {
    const provider = getProvider(providerName)
    return await provider?.search(query) ?? []
  } catch (e) {
    console.error(`Provider ${providerName} failed.`, e)
  }

  return []
}

export const getInfo = async (providerName: string, id: string): Promise<Playlist | null> => {
  const provider = getProvider(providerName)
  return await provider?.getInfo(id) ?? null
}
export const getSource = async (
  providerName: string,
  resultId: string,
  sourceId: string,
  params?: Record<string, string>
): Promise<File | null> => {
  const provider = getProvider(providerName)
  return await provider?.getSource(resultId, sourceId, params) ?? null
}