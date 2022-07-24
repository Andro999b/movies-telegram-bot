const providers = require('../providers')
const util = require('util')

const provider = 'anigato'
const id = 'https://anigato.ru/anime_ova/1794-vanpanchmen-ova.html'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)