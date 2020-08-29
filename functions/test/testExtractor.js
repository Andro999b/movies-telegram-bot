const extract = require('../extract')

const url = decodeURIComponent('http://aniqit.com/go/seria/404856/f357b541cdc214e87db8541ae679a876/720p')
// eslint-disable-next-line no-console
console.log(url)

extract({
    url,
    type: 'anigit'
}).then(console.log) // eslint-disable-line no-console