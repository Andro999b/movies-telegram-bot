import regExprExtractor from './regExprExtractor'

export default regExprExtractor([
    /\[HD[^\]]*\](https?[^\s"]+)/,
    /\[SD[^\]]*\](https?[^\s"]+)/
])