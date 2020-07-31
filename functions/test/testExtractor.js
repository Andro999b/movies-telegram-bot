const extract = require('../extract')

const url = decodeURIComponent('https%3A%2F%2Fvideo.sibnet.ru%2Fshell.php%3Fvideoid%3D3733031')
// eslint-disable-next-line no-console
console.log(url)

extract({
    url,
    type: 'sibnetmp4'
}).then(console.log) // eslint-disable-line no-console