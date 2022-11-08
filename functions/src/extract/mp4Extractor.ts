import regExprExtractor from './regExprExtractor.js'

export default regExprExtractor(
  [
    /\[1080p\](https?[^,]+\.mp4(?!\.))/,
    /\[720p\](https?[^,]+\.mp4(?!\.))/,
    /\[480p\](https?[^,]+\.mp4(?!\.))/,
    /\[360p\](https?[^,]+\.mp4(?!\.))/,
    /\[240p\](https?[^,]+\.mp4(?!\.))/,
    /(https?[^,]+_1080p\.mp4(?!\.))/,
    /(https?[^,]+_720p\.mp4(?!\.))/,
    /(https?[^,]+_480p\.mp4(?!\.))/,
    /(https?[^,]+_360p\.mp4(?!\.))/,
    /(https?[^,]+_240p\.mp4(?!\.))/
  ],
)