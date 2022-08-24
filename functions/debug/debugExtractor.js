const extract = require('../src/extract')
const debug = require('debug')('extract')

const url = decodeURIComponent('12')
const params = {
    thash: '63514a5821d395f177ea95b9b0e29380',
    tid: '77025',
    ttype: 'video'
}
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0'
}
// eslint-disable-next-line no-console
debug(url)

extract({
    url,
    type: 'anigit',
    ...params
}, headers).then(debug) // eslint-disable-line no-console