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
import UAKinoClubProvider from './UAKinoClubProvider.js'
import UASerialsProvider from './UASerialsProvider.js'
import Provider from './Provider.js'
import { File, Playlist, ProvidersNames, SearchResult } from '../types/index.js'

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
  uaserials: new UASerialsProvider()
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