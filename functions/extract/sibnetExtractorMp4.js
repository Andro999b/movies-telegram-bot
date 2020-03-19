
const regExprExtractor = require('./regExprExtractor')

module.exports = regExprExtractor([{
    expression: /\/[0-9A_Za-z/]+\.mp4/,
    transform: (matches) => {
        const sibnetUrl = encodeURIComponent(`https://video.sibnet.ru${matches[0]}`)
        return `https://sibnet.movies-player.workers.dev/?${sibnetUrl}`
    }
}])