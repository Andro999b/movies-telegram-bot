const providers = require('../src/providers')
const util = require('util')

const provider = 'anitubeua'
const id = 'https://anitube.in.ua/4026-hajime-no-ippo.html'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)