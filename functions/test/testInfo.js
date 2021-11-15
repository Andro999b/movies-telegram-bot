const providers = require('../providers')
const util = require('util')

const provider = 'rezka'
const id = 'https%3A%2F%2Frezka.ag%2Fanimation%2Faction%2F2373-kovboy-bibop-2001.html'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)