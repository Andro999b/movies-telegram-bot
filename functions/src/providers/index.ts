import SeasonvarProvider from './SeasonvarProvider'
import KinogoProvider from './KinogoProvider'
import KinovodProvider from './KinovodProvider'
import AnimeVostProvider from './AnimeVostProvider'
import AnimediaProvider from './AnimediaProvider'
import AnidubProvider from './AnidubProvider'
import AnigatoProvider from './AnigatoProvider'
import VideoCDNProvider from './VideoCDNProvider'
import AnitubeUAProvider from './AnitubeUAProvider'
import EneyidaProvider from './EneyidaProvider'
import UAFilmTVProvider from './UAFilmTVProvider'
import UASerialsProvider from './UASerialsProvider'
import Provider from './Provider'
import { File, Playlist, SearchResult } from '../types'

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