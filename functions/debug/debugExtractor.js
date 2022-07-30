const extract = require('../extract')

const url = decodeURIComponent('//aniqit.com/serial/42046/e72c92f9e68d53225d4870fed9aa3f28/720p')
const params = { id: '988436', hash: '7c2479a7b1ff15083598224dc176235b' }
const headers = { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0'
}
// eslint-disable-next-line no-console
console.log(url)

extract({
    url,
    type: 'anigit',
    ...params
}, headers).then(console.error) // eslint-disable-line no-console