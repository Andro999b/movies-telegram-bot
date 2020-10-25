const extract = require('../extract')

const url = decodeURIComponent('//aniqit.com/go/seria/437477/15c18780aa0aee58d81628264a6ecf8a/720p')
const headers = { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0'
}
// eslint-disable-next-line no-console
console.log(url)

extract({
    url,
    type: 'anigit'
}, headers).then(console.log) // eslint-disable-line no-console