const extract = require('../src/extract')

const url = decodeURIComponent('//kodik.biz/serial/21024/83801944d896d2e947f3e828f17b6d80/720p')
const params = { hash: '83528239dc6abb1c316dce829f24a6b7', id: '620128' }
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