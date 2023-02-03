import regExprExtractor from './regExprExtractor'

const patterns = [
  /(https?.+\.m3u8)/,
]

export default regExprExtractor(patterns)
export const m3u8proxy = regExprExtractor(patterns, true)