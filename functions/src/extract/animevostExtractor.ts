import regExprExtractor from './regExprExtractor.js'

export default regExprExtractor([
  /\[HD[^\]]*\](https?[^\s"]+)/,
  /\[SD[^\]]*\](https?[^\s"]+)/
])