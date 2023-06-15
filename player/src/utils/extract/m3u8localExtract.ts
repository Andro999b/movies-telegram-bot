import { ExtractFun } from '.'
import regexExtractor from './regexExtractor'

const m3u8localExtract = (): ExtractFun => regexExtractor([
  /(https?.+\.m3u8)/,
])

export default m3u8localExtract
