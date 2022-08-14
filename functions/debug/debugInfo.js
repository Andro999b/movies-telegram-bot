const providers = require('../src/providers')
const util = require('util')

const provider = 'animevost'
const id = 'https://animevost.org/tip/tv/2571-nanatsu-no-taizai-fundo-no-shinpan.html'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)