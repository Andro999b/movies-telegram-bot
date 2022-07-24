const extract = require('../extract')

//https://mcw4r3l663.execute-api.eu-central-1.amazonaws.com/prod/api/extract?type=anigit&url=https%3A%2F%2Faniqit.com%2Fvideo%2F43377%2F3d7f2c2d72a6e82978c2458e489358dc%2F720p
const url = decodeURIComponent('//aniqit.com/video/58648/1247aab35781f3abdaa2790488175dbd/720p')
const headers = { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0'
}
// eslint-disable-next-line no-console
console.log(url)

extract({
    url,
    type: 'anigit' 
}, headers).then(console.log) // eslint-disable-line no-console