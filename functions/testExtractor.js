const extract = require('./extract')

const url = decodeURIComponent('https://video.sibnet.ru/shell.php?videoid=1992109')
console.log(url)

extract({
    url,
    type: 'sibnetmp4'
}).then(console.log) // eslint-disable-line 