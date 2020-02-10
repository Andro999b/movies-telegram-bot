const extract = require('./extract')

const url = decodeURIComponent('https://video.sibnet.ru/shell.php?videoid=3563047')
console.log(url)

extract({
    url,
    type: 'sibnet'
}).then(console.log) // eslint-disable-line 