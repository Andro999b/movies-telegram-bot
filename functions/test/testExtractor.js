const extract = require('../extract')

const url = decodeURIComponent('https://video.sibnet.ru/shell.php?videoid=1864980')
// eslint-disable-next-line no-console
console.log(url)

extract({
    url,
    type: 'sibnetmp4'
}).then(console.log) // eslint-disable-line no-console