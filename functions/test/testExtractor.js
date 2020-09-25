const extract = require('../extract')

const url = decodeURIComponent('/player/index.php?vid=/s1/7905/1/1.mp4&url=/anime/full/7905-uskorennyy-mir-accel-world.html&id=-1')
const headers = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0' }
// eslint-disable-next-line no-console
console.log(url)

extract({
    url,
    type: 'anidub'
}, headers).then(console.log) // eslint-disable-line no-console