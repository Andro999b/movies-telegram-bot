const extract = require('./extract')

<<<<<<< Updated upstream
const url = decodeURIComponent('//kodik.info/serial/6252/7f6a1de29cc011a85029a65d52988dba/720p?season=2&only_episode=true&episode=8')
=======
const url = decodeURIComponent('https://online.animedia.tv/embed/9432/1/1')
>>>>>>> Stashed changes
console.log(url)

extract({
    url,
<<<<<<< Updated upstream
    type: 'kodik',
    referer: 'https://yummyanime.club'
=======
    type: 'animedia'
>>>>>>> Stashed changes
}).then(console.log) // eslint-disable-line 