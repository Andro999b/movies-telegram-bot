const extract = require('./extract')

const url = decodeURIComponent('https://play.roomfish.ru/2147410323?player=9')
console.log(url)

extract({
    url,
    type: 'animevost'
}).then(console.log) // eslint-disable-line 