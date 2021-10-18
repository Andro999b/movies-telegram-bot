const providers = require('../providers')
const util = require('util')

const provider = 'kinogo'
const id = 'https%3A%2F%2Fkinogo.la%2F7796-family-guy-1-20-sezon.html'

console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line
    .catch(console.error)