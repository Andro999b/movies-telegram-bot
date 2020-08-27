const extract = require('../extract')

const url = decodeURIComponent('//kodik.cc/video/531/fba6e1e2b8e5a56b96b92ea34f1bf5b8/720p')
// eslint-disable-next-line no-console
console.log(url)

extract({
    url,
    type: 'anigit'
}).then(console.log) // eslint-disable-line no-console