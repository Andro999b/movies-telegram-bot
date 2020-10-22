const extract = require('../extract')

const url = decodeURIComponent('/player/index.php?vid=/s1/11058/1/2.mp4&url=/anime/anime_ongoing/11188-vtoroj-mjejdzhor-major-2nd.html&id=-1')
const headers = { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0'
}
// eslint-disable-next-line no-console
console.log(url)

extract({
    url,
    type: 'anidub'
}, headers).then(console.log) // eslint-disable-line no-console