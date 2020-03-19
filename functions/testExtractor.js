const extract = require('./extract')

const url = decodeURIComponent('https://stormo.online/embed/506265/')
console.log(url)

extract({
    url,
    type: 'stormo'
}).then(console.log) // eslint-disable-line 