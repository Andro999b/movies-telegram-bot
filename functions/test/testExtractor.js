const extract = require('../extract')

const url = decodeURIComponent('https://video.sibnet.ru/shell.php?videoid=4027030')
const headers = { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0'
}
// eslint-disable-next-line no-console
console.log(url)

extract({
    url,
    type: 'sibnetmp4',
}, headers).then(console.log) // eslint-disable-line no-console