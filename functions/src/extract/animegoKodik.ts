import providersConfig from '../providersConfig'
import { Extractor } from './index'
import kodikExtractor from './kodikExtractor'

const animegoConfig = providersConfig.providers.animego
const kodikSign = animegoConfig['kodikSign'] as Record<string, string>

const animegoKodikExtractor: Extractor = ({ url }) => {
  return kodikExtractor({
    url,
    referer: animegoConfig.baseUrl,
    kodikSign
  })
}

export default animegoKodikExtractor