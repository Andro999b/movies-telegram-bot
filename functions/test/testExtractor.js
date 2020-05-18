const extract = require('../extract')

const url = decodeURIComponent('https://www.stormo.online/embed/593318/')
console.log(url)

extract({
    url,
    type: 'stormo'
}).then(console.log) // eslint-disable-line 