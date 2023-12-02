import { File, Playlist, ProvidersNames, SearchResult } from '../types/index'
import Provider from './Provider'
import AnimeVostProvider from './AnimeVostProvider'
import VideoCDNProvider from './VideoCDNProvider'
import AnitubeUAProvider from './AnitubeUAProvider'
import EneyidaProvider from './EneyidaProvider'
import UAFilmTVProvider from './UAFilmTVProvider'
import UAKinoClubProvider from './UAKinoClubProvider'
import UASerialsProvider from './UASerialsProvider'
import AnimegoProvider from './AnimegoProvider'
import RezkaProvider from './RezkaProvider'
import AnimelibProvider from './AnimelibProvider'
import AnimeUAClubProvider from './AnimeUAClubProvider'


const providers: Record<ProvidersNames, Provider> = {
  animelib: new AnimelibProvider(),
  animeuaclub: new AnimeUAClubProvider(),
  animego: new AnimegoProvider(),
  animevost: new AnimeVostProvider(),
  videocdn: new VideoCDNProvider(),
  anitubeua: new AnitubeUAProvider(),
  eneyida: new EneyidaProvider(),
  uafilmtv: new UAFilmTVProvider(),
  uakinoclub: new UAKinoClubProvider(),
  uaserials: new UASerialsProvider(),
  rezka: new RezkaProvider()
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
      console.error(`Provider search ${providerName} failed with query ${query}.`, e)
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
    console.error(`Provider search ${providerName} failed with query ${query}.`, e)
  }

  return []
}

export const getInfo = async (providerName: ProvidersNames, id: string): Promise<Playlist | null> => {
  const provider = getProvider(providerName)
  try {
    return await provider?.getInfo(id) ?? null
  } catch (error) {
    console.error(`Provider info ${providerName} fails with id ${id}`, error)
    return null
  }
}
export const getSource = async (
  providerName: ProvidersNames,
  resultId: string,
  sourceId: string,
  params?: Record<string, string>
): Promise<Partial<File> | null> => {
  const provider = getProvider(providerName)
  try {
    return await provider?.getSource(resultId, sourceId, params) ?? null
  } catch (error) {
    console.error(`Provider source ${providerName} fails.`, { resultId, sourceId, params, error })
    return null
  }
}