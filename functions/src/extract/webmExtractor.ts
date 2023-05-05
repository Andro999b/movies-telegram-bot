import regExprExtractor from './regExprExtractor'

const patterns = [
  /(https?.+\.webm)/
]

export default regExprExtractor(patterns)