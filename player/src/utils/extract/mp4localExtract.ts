import { ExtractFun } from '.'
import regexExtractor from './regexExtractor'

const mp4localExtract = (): ExtractFun => regexExtractor([
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
])

export default mp4localExtract
