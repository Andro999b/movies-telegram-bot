const extract = require('../src/extract')

const url = decodeURIComponent('/player/index.php?vid=/s2/9488/1.mp4&url=/anime/full/9366-yunost-v-dushe-pushka-v-ruke-aoharu-x-kikanjuu-01-iz-12.html&ses=ff&id=-1')
const params = { }
const headers = { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0'
}
// eslint-disable-next-line no-console
console.log(url)

extract({
    url,
    type: 'anidub',
    ...params
}, headers).then(console.error) // eslint-disable-line no-console