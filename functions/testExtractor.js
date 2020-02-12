const extract = require('./extract')

const url = decodeURIComponent('//kodik.info/serial/6252/7f6a1de29cc011a85029a65d52988dba/720p?season=2&only_episode=true&episode=8')
console.log(url)

extract({
    url,
    type: 'kodik',
    referer: 'https://yummyanime.club'
}).then(console.log) // eslint-disable-line 