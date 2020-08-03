const extract = require('../extract')

const url = decodeURIComponent('https%3A%2F%2Fstreamguard.cc%2Fvideo%2F95fd0eec726288c9%2Fiframe')
// eslint-disable-next-line no-console
console.log(url)

extract({
    url,
    type: 'sibnetmp4'
}).then(console.log) // eslint-disable-line no-console