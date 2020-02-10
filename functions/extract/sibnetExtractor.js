const regExprExtractor = require('./regExprExtractor')

module.exports = regExprExtractor([
    {
        expression: /\/[0-9A_Za-z/]+\.m3u8/,
        transform: (m) => `https://video.sibnet.ru${m[0]}`  
    }
])