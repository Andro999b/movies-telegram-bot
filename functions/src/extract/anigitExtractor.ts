import providersConfig from '../providersConfig'
import { Extractor } from '.'
import kodikExtractor from './kodikExtractor'

const anigatoConfig = providersConfig.providers.anigato
const kodikSign = anigatoConfig['kodikSign'] as Record<string, string>

const anigitExtractor: Extractor = ({ url, ttype, tid, thash, season }) => {
  return kodikExtractor({
    url,
    referer: anigatoConfig.baseUrl,
    kodikSign,
    tid,
    ttype,
    thash,
    season
  })
}

export default anigitExtractor