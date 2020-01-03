const extract = require('./extract')

const url = decodeURIComponent('https%3A%2F%2Fplay.roomfish.ru%2F2147395654')
console.log(url)

extract({
    url,
    type: 'animevost'
}).then(console.log) // eslint-disable-line 