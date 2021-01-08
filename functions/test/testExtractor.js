const extract = require('../extract')

const url = decodeURIComponent('https://aniqit.com/serial/24057/3002e903007e30473cb85755964eea48/720p?season=1&only_episode=true&episode=100&translations=false')
const headers = { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0'
}
// eslint-disable-next-line no-console
console.log(url)

extract({
    url,
    type: 'anigit'
}, headers).then(console.log) // eslint-disable-line no-console