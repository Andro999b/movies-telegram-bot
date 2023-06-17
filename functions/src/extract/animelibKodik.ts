import providersConfig from '../providersConfig'
import { Extractor } from './index'
import kodikExtractor from './kodikExtractor'

const animelibConfig = providersConfig.providers.animelib
const kodikSign = animelibConfig['kodikSign'] as Record<string, string>

const animelibKodikExtractor: Extractor = ({ url }) => {
  return kodikExtractor({
    url,
    referer: animelibConfig.baseUrl,
    kodikSign
  })
}

export default animelibKodikExtractor