const providers = require('../providers')
const util = require('util')

const provider = 'rezka'
const id = 'https://rezka.ag/cartoons/comedy/1843-griffiny.html'

console.log(decodeURIComponent(id))

providers.getInfo(provider, id)
    .then((details) => console.log(util.inspect(details, false, null, true)))// eslint-disable-line