const providers = require('../providers')
const util = require('util')

const provider = 'anidub'
const id = 'https%3A%2F%2Fanime.anidub.life%2Fanime%2Ffull%2F9589-klass-ubiyc-tv-2-ansatsu-kyoushitsu-tv-2-01-iz-25.html'

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line