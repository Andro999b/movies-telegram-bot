const providers = require('../providers')
const util = require('util')

const provider = 'anidub'
const id = 'https%3A%2F%2Fanime.anidub.life%2Fanime%2Fanime_ongoing%2F11628-vladyka-tv-4-overlord-tv-iv-01-iz-13.html'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)