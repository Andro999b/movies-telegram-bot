const regExprExtractor = require('./regExprExtractor')

module.exports = regExprExtractor([
    /\[1080p\](https?.+\.mp4)/,
    /\[720p\](https?.+\.mp4)/,
    /\[480p\](https?.+\.mp4)/,
    /\[360p\](https?.+\.mp4)/,
    /\[240p\](https?.+\.mp4)/,
])