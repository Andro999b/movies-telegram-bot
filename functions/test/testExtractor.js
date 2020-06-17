const extract = require('../extract')

const url = decodeURIComponent('https://play.roomfish.ru/2147406642')
// eslint-disable-next-line no-console
console.log(url)

extract({
    url,
    type: 'animevost'
}).then(console.log) // eslint-disable-line no-console