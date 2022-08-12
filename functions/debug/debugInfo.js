const providers = require('../providers')
const util = require('util')

const provider = 'eneyida'
const id = 'https%3A%2F%2Feneyida.tv%2F2319-zoryana-brama-sg-1.html'

// eslint-disable-next-line no-console
console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)