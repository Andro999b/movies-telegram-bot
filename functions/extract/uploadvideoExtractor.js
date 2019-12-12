
const regExprExtractor = require('./regExprExtractor')

module.exports = regExprExtractor([
    /(https:\/\/uploadvideo.info\/get_file[^,]+_1080p\.mp4)/,
    /(https:\/\/uploadvideo.info\/get_file[^,]+_720p\.mp4)/,
    /(https:\/\/uploadvideo.info\/get_file[^,]+_480p\.mp4)/,
    /(https:\/\/uploadvideo.info\/get_file[^,]+_360p\.mp4)/,
    /(https:\/\/uploadvideo.info\/get_file[^,]+_240p\.mp4)/,
    /\[1080p\](https:\/\/uploadvideo.info\/get_file[^,]+\.mp4)/,
    /\[720p\](https:\/\/uploadvideo.info\/get_file[^,]+\.mp4)/,
    /\[480p\](https:\/\/uploadvideo.info\/get_file[^,]+\.mp4)/,
    /\[360p\](https:\/\/uploadvideo.info\/get_file[^,]+\.mp4)/,
    /\[240p\](https:\/\/uploadvideo.info\/get_file[^,]+\.mp4)/,
])