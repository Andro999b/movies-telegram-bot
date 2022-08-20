const extract = require('../src/extract')

const url = decodeURIComponent('https://csst.online/embed/609157/')
const params = { hash: '83528239dc6abb1c316dce829f24a6b7', id: '620128' }
const headers = { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0'
}
// eslint-disable-next-line no-console
console.log(url)

extract({
    url,
    type: 'mp4',
    ...params
}, headers).then(console.error) // eslint-disable-line no-console