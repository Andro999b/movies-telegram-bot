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
import UAKinoClubProvider from './UAKinoClubProvider'
import UASerialsProvider from './UASerialsProvider'
import Provider from './Provider'
import { File, Playlist, ProvidersNames, SearchResult } from '../types/index'
import GidOnlineProvider from './GidOnlineProvider'

const providers: Record<ProvidersNames, Provider> = {
  seasonvar: new SeasonvarProvider(),
  kinogo: new KinogoProvider(),
  kinovod: new KinovodProvider(),
  animevost: new AnimeVostProvider(),
  animedia: new AnimediaProvider(),
  anidub: new AnidubProvider(),
  anigato: new AnigatoProvider(),
  videocdn: new VideoCDNProvider(),
  anitubeua: new AnitubeUAProvider(),
  eneyida: new EneyidaProvider(),
  uafilmtv: new UAFilmTVProvider(),
  uakinoclub: new UAKinoClubProvider(),
  uaserials: new UASerialsProvider(),
  gidonline: new GidOnlineProvider()
}


export const getProviders = (): string[] => {
  return Object.keys(providers)
}

export const getProvider = (name: ProvidersNames): Provider | undefined => {
  return providers[name]
}

export const search = async (providers: ProvidersNames[], query: string): Promise<SearchResult[]> => {
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

export const searchOne = async (providerName: ProvidersNames, query: string): Promise<SearchResult[]> => {
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

export const getInfo = async (providerName: ProvidersNames, id: string): Promise<Playlist | null> => {
  const provider = getProvider(providerName)
  return await provider?.getInfo(id) ?? null
}
export const getSource = async (
  providerName: ProvidersNames,
  resultId: string,
  sourceId: string,
  params?: Record<string, string>
): Promise<File | null> => {
  const provider = getProvider(providerName)
  return await provider?.getSource(resultId, sourceId, params) ?? null
}