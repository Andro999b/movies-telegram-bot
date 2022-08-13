const providers = require('../src/providers')
const util = require('util')

const provider = 'anidub'
const id = 'https%3A%2F%2Fanime.anidub.life%2Fanime%2Ffull%2F9366-yunost-v-dushe-pushka-v-ruke-aoharu-x-kikanjuu-01-iz-12.html'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)