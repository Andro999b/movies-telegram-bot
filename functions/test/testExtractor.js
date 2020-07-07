const extract = require('../extract')

const url = decodeURIComponent('%2F%2Fvideo.sibnet.ru%2Fshell.php%3Fvideoid%3D3804323')
// eslint-disable-next-line no-console
console.log(url)

extract({
    url,
    type: 'sibnetmp4'
}).then(console.log) // eslint-disable-line no-console