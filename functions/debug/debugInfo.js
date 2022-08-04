const providers = require('../providers')
const util = require('util')

const provider = 'anidub'
const id = 'https%3A%2F%2Fanime.anidub.life%2Fanime%2Ffull%2F11115-dorohedoro-dorohedoro-anons.html'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)